import { Router } from 'express';
import {CommentModel, FrontendUser, LoginData, MessageModel, UserModel} from "../includes/models";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcryptjs";

let slugify = (str)=>{
    return (str + "").toLowerCase()
        .replace(/(\w)\'/g, '$1')       // Special case for apostrophes
        .replace(/[^a-z0-9_\-]+/g, '-') // Replace all non-word chars with -
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');
};

//RSA 1024 private key
let secretKey = "MIICXgIBAAKBgQDo1VYRClAu/ukeRnOBgvWRAnyjVdnkUg1Nz5qWN/++SNFd0ihb\n" +
    "Xze/auAipEyOtSAzFt+3dxBBVUBs9pcKWyyjmaQvW3w4b8vO+Gl7zTAwuxwW5f4O\n" +
    "yp35Qq5xPO59xuVe62T911JAWb9pWKhEJ68+xLIqOcetk8YezMwO4fD/iwIDAQAB\n" +
    "AoGBAJwvD07a9jKwODxg0facnJGrc2Q1oLYx/E6n5nDCG8HPIvKmmP/B/alfzf4u\n" +
    "7FQGWBUtUODG85Z/03nEaElAI85LItqlifX+vupy8jKN/B4lpz0A7NEazx63A9tA\n" +
    "NN9Kxr+iCRiRZ5Z5G88CiRMR7wCCbi+25aBqrv+fivVl+qdBAkEA9b/pY7GsvMrc\n" +
    "dIHUsZAbu5UTySHYySNORGcZqVEd691bYSB7UFKSi0fu41klMob3zogWDXtr6gVB\n" +
    "rWOcMsinGwJBAPKLgWuuYypiyC5qmK1Le005aIFqnJD8Lc4bEo8/Im81X89lgydA\n" +
    "qqtoyqFVATH2f3A5+a7JyR7ucjGYqJ/+YFECQQCS0LltLuukyokULbBU+GQpF/H/\n" +
    "GnJ6D9aldPbWubhnfhImn5IsNXiJL0tflZVsb0fConiSS2b4I3XOUZEyob97AkEA\n" +
    "1/vS7AkG1Z/Rk0PpYahtzH7qyRQfCB0IzRjeliEqkM1+3DkRacr0MF/I0ZHY1p0j\n" +
    "LtTxuuyF5L2BgxjmUFM9gQJARlqDIAfidmCVObj9jeGT2XOPTZ5KuOZSq6DMk9UI\n" +
    "aPhU97fxq5ymDzhUItD2BMG/gRNtYceNs8k8M5EwLgwrNQ==";

/**
 * MIDDLEWARE - checkJwt verifies that the auth token provided is valid
 */
const checkJwt = (req, res, next) => {
    const token = <string>req.headers["auth"];
    let jwtPayload;
    
    //Try to validate the token and get data
    try {
        jwtPayload = <any>jwt.verify(token, secretKey);
        res.locals.jwtPayload = jwtPayload;
    } catch (error) {
        res.status(401);
        res.jsonp({ success: false, message:"Please login to edit" });
        res.send();
        return;
    }
    
    next();
};
/**
 * MIDDLEWARE - checkHtml flags if content has html
 */
const checkHtml = (req,res,next) => {
    let data = req.body;
    
    if(/<\/?[a-z][\s\S]*>/i.test(data.content)){
        res.status(401);
        res.jsonp({ success:false, message:"Your message contains html input. Saving is forbidden." });
        return;
    }
    
    next();
};

/**
 * API module for all api endpoints
 * @param router express.Router
 * @returns router express.Router
 */
function Api(router: Router){
    /**
     * POST function to log in
     * @param email email address to log into
     * @param password password for the login email
     */
    router.post('/auth/login',async (req, res, next) => {
        let data = req.body;
        let user = await UserModel.login(<LoginData>data);
        if(!user){
            res.status(401);
            res.jsonp({ success:false, message:"Your credentials are wrong, please try again" });
        }
        //sign JWT, valid for 1 hour
        let userF = <FrontendUser>{
            id: user._id,
            name: user.name,
            email: user.email,
            nick: user.nick,
            access: UserModel.getAccess(user),
            img: user.img,
            points: user.points,
        };
        const token = jwt.sign(
            userF,
            secretKey,
            { expiresIn: "216h" }
        );
        res.jsonp({"success":true, "token":token});
    });
    
    /**
     * Logout
     */
    router.get('/auth/logout', (req,res) => {
        res.jsonp({ success:true });
    });
    
    
    /**
     * Load message page
     */
    router.get('/messages', async (req,res,next)=>{
        let messages = await MessageModel.all();
        let data = await Promise.all(messages.map(async row => {
            let user = await UserModel.findById(row.createdBy);
            return Object.assign({
                url: `/messages/${row.id}/${slugify(row.title)}`,
                user: {
                    name: user.name,
                    points: user.points,
                }
            },JSON.parse(JSON.stringify(row)));
        }));
        res.jsonp(data);
    });
    
    /**
     * New message
     */
    router.post('/messages', [checkJwt,checkHtml], async (req, res, next) => {
        let data = req.body;
        let title = data.title || "";
        let tags = data.tags || [];
        let content = data.content;
        let id = data.user?.id;
    
        if(!id) {
            res.status(401);
            res.jsonp({ success:false, message:"Logged in user required." });
            return;
        }
        let message = await MessageModel.create({
            "views":0,
            "comments":0,
            "votes":0,
            "tags":tags,
            "modified":null,
            "status":"active",
            "title":title,
            "content":content,
            "createdBy":id
        });
        data = JSON.parse(JSON.stringify(message));
        data.id = message._id;
        res.jsonp({ success: !!message, data: data || null });
    });
    
    /**
     * Edit message
     */
    router.patch('/messages', [checkJwt,checkHtml], async (req, res, next) => {
        let data = req.body;
    
        if(!data.id) {
            res.status(401);
            res.jsonp({ success:false, message:"Please add a message id." });
            return;
        }
        if(!data.user?.id) {
            res.status(401);
            res.jsonp({ success:false, message:"Logged in user required." });
            return;
        }
    
        let message = await MessageModel.findById(data.id);
        if(data.title) { message.title = data.title }
        if(data.tags) { message.tags = data.tags }
        if(data.content) { message.content = data.content }
        message.modified = (new Date()).toISOString();
        message.modifiedBy = data.user.id;
        let result = await message.save();
        res.jsonp({ success: !!result, data: result || null });
    });
    
    /**
     * Get comments for message
     */
    router.get('/comments/:id', async (req,res,next)=>{
        let id = req.params.id;
        let data = await CommentModel.getByMessage(id);
        data = await CommentModel.populate(data,[{
            path:"createdBy",
            select:["name","points","img","_id"]
        }]);
        data = await CommentModel.populate(data,[{
            path:"modifiedBy",
            select:["name","points","img","_id"]
        }]);
        /* ignoring nested data
        let nestedData = [];
        data.sort((a,b)=>{
            if(a.parent < b.parent) { return -1; }
            if(a.parent > b.parent) { return +1; }
            return 0
        }).map(comment => {
            comment = JSON.parse(JSON.stringify(comment)); //flatten data
            comment.children = void 0;
        }).map(comment => {
            if(comment.parent){
                let parent = data.find(e=>e.id===comment.parent);
                parent.children = parent.children || [];
                parent.children.push(comment);
            } else {
                nestedData.push(comment);
            }
        });*/
        res.jsonp(data);
    });
    
    /**
     * New comment
     */
    router.post('/comments', [checkJwt,checkHtml], async (req, res, next) => {
        let data = req.body;
        let content = data.content;
        let parentId = data.parentId || "";
        let userId = data.user?.id;
        let messageId = data.messageId;
        
        if(!userId) {
            res.status(401);
            res.jsonp({ success:false, message:"Logged in user required." });
            return;
        }
        
        let message = await MessageModel.findById(messageId);
        if(!message) {
            res.status(404);
            res.jsonp({ success:false, message:"Message id is not valid." });
            return;
        }
        
        let comment = await CommentModel.create({
            "content":content,
            "message":message.id,
            "createdBy":userId,
            "lft":1,
            "rgt":2,
        });
        let parent;
        if(parentId){
            parent = await CommentModel.findById(parentId);
        }
        if(parent) {
            CommentModel.shiftNode(parent.rgt, 2, parent.root);
            comment.parent = parent.id;
            comment.root = parent.root;
            comment.lft = parent.rgt - 2;
            comment.rgt = parent.rgt - 1;
        } else {
            comment.root = comment.id;
        }
        let data2 = await comment.save();
        let result = await CommentModel.findById(data2._id)
            .populate("createdBy",["name","points","img","_id"])
            .populate("modifiedBy", ["name","points","img","_id"]);
        
        //increment comment count
        message.updateOne({ comments: ++message.comments }, () => {});
        
        res.jsonp({ success: !!comment, data: result || null });
    });
    
    /**
     * Edit comment
     */
    router.patch('/comments', [checkJwt,checkHtml], async (req, res, next) => {
        let data = req.body;
        
        if(!data.id) {
            res.status(401);
            res.jsonp({ success:false, message:"Your message did not contain an id. Saving is forbidden." });
            return;
        }
        if(!data.user?.id) {
            res.status(401);
            res.jsonp({ success:false, message:"Logged in user required." });
            return;
        }
        
        let comment = await CommentModel.findById(data.id);
        if(data.content) { comment.content = data.content }
        comment.modified = (new Date()).toISOString();
        comment.modifiedBy = data.user.id;
        let data2 = await comment.save();
        let result = await CommentModel.findById(data2._id)
            .populate("createdBy",["name","points","img","_id"])
            .populate("modifiedBy", ["name","points","img","_id"]);
        res.jsonp({ success: !!result, data: result || null });
    });
    

    /**
     * GET helper function to encrypt a password
     * @param pass the password
     */
    // router.get('/encrypt', (req,res,next)=>{
    //     let pass = req.query.pass;
    //     res.jsonp({"pass":bcrypt.hashSync(pass, 8),"date":(new Date).toISOString()} )
    // });

    return router;
}

module.exports = Api;
