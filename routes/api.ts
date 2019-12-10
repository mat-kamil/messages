import { Router } from 'express';
import {FrontendUser, LoginData, MessageModel, UserModel} from "../includes/models";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";

let slugify = (str)=>{
    return (str + "").toLowerCase()
        .replace(/(\w)\'/g, '$1')       // Special case for apostrophes
        .replace(/[^a-z0-9_\-]+/g, '-') // Replace all non-word chars with -
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');
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
            access: user.getAccess(),
            image: user.image,
        };
        const token = jwt.sign(
            userF,
            "muzmessages super secret key very long and complicated",
            { expiresIn: "1h" }
        );
        res.jsonp({"success":true, "token":token});
    });
    
    router.get('/messages', async (req,res,next)=>{
        let messages = await MessageModel.all();
        let data = await Promise.all(messages.map(async row => {
            let user = await UserModel.findById(row.createdBy);
            return Object.assign({
                url: `/${row.id}/${slugify(row.title)}`,
                user: {
                    name: user.name,
                    points: user.points,
                }
            },JSON.parse(JSON.stringify(row)));
        }));
        res.jsonp(data);
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
