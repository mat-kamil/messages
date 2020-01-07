import * as express from 'express';
import {MessageModel, UserModel} from "../../includes/models";
import * as jwt from "jsonwebtoken";
import { Api } from '../api';

export class ApiMessage {
    public router: express.Router;
    constructor(router: express.Router) {
        this.router = router;
        /**
         * Load message page
         */
        router.get('/messages', this.getMessages);
        router.post('/messages', [Api.checkJwt,Api.checkHtml], this.newMessage);
        router.patch('/messages', [Api.checkJwt,Api.checkHtml], this.editMessage);
    }
    
    /**
     * Slugify function to make a input text url safe
     * @param str text to slugify
     */
    public slugify = (str) => {
        return (str + "").toLowerCase()
            .replace(/(\w)\'/g, '$1')       // Special case for apostrophes
            .replace(/[^a-z0-9_\-]+/g, '-') // Replace all non-word chars with -
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
            .replace(/^-+/, '')             // Trim - from start of text
            .replace(/-+$/, '');
    };
    
    private getMessages = async (req,res,next)=>{
        // @ts-ignore
        let messages = await MessageModel.all();
        let data = await Promise.all(messages.map(async row => {
            let user = await UserModel.findById(row.createdBy);
            return Object.assign({
                url: `/messages/${row.id}/${this.slugify(row.title)}`,
                user: {
                    name: user.name,
                    points: user.points,
                }
            },JSON.parse(JSON.stringify(row)));
        }));
        res.jsonp(data);
    };
    
    /**
     * New message
     */
    private newMessage = async (req, res, next) => {
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
    };
    
    /**
     * Edit message
     */
    private editMessage = async (req, res, next) => {
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
    };
    
    
}
