import {MessageModel} from "../includes/models";

/**
 * Page module for all page URL endpoints
 * @param router express.Router
 * @returns router express.Router
 */
function Page(router){
    /* GET home page. */
    router.get('/', function(req, res, next) {
        res.render('index', { title: 'MuzMessage' });
    });
    
    /* GET message page */
    router.get('/messages/:id/:slug', async (req,res, next) => {
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
    });
    
    /* GET new message page */
    router.get('/messages/new', async (req,res, next) => {
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
    });
    
    return router;
}

module.exports = Page;
