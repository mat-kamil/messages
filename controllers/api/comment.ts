import * as express from 'express';
import {CommentModel, MessageModel} from "../../includes/models";
import * as jwt from "jsonwebtoken";
import {Api} from "../api";

export class ApiComment {
    public router: express.Router;
    constructor(router: express.Router) {
        this.router = router;
        router.get('/comments/:id', this.getComments);
        router.post('/comments', [Api.checkJwt,Api.checkHtml], this.newComment);
        router.patch('/comments', [Api.checkJwt,Api.checkHtml], this.editComment);
    };
    
    /**
     * Get comments for message
     */
    private getComments = async (req,res,next)=>{
        let id = req.params.id;
        // @ts-ignore
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
    };
    
    /**
     * New comment
     */
    private newComment = async (req, res, next) => {
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
            // @ts-ignore
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
    };
    
    /**
     * Edit comment
     */
    private editComment = async (req, res, next) => {
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
    };
}
