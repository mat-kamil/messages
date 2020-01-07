import * as express from 'express';
import {MessageModel} from "../../includes/models";

export class PageMessagePage {
    public router: express.Router;
    constructor(router: express.Router) {
        this.router = router;
        router.get('/messages/:id/:slug', this.getMessagePage);
        router.get('/messages/new', this.getNewMessagePage);
    }
    
    /** GET message page
     * This is the message view page ( /message/:id/:slug)
     * The slug portion is not used in identifying the page
     */
    private getMessagePage = async (req,res, next) => {
        let id = req.params.id;
        let message = await MessageModel.findById(id).populate({
            path: "createdBy",
            populate: { path: "roles" }
        }).populate({
            path: "modifiedBy",
            populate: { path: "roles" }
        });
        if(message) {
            message.updateOne({ views: ++message.views }, () => {});
            
            res.render('message', {
                title: message.title,
                includeJs: [
                    "/js/lib/domador.min.js",
                    "/js/lib/megamark.min.js",
                    "/js/lib/woofmark.min.js",
                    "/js/message.js"
                ],
                includeCss: ["/css/woofmark.min.css","/css/message.css"],
                message: message,
            });
        }
    };
    
    /** GET new message page
     * This is used when creating a new message
     */
    private getNewMessagePage = async (req,res, next) => {
        res.render('message', {
            title: "New Message",
            includeJs: [
                "/js/lib/domador.min.js",
                "/js/lib/megamark.min.js",
                "/js/lib/woofmark.min.js",
                "/js/message.js"
            ],
            includeCss: ["/css/woofmark.min.css","/css/message.css"],
        });
    }
}
