import {MessageModel} from "../includes/models";
import moment = require("moment");

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
    
    
    router.get('/:id/:slug', async (req,res, next) => {
        let id = req.params.id;
        let message = await MessageModel.findById(id);
        if(message) {
            message.updateOne({ views: ++message.views }, () => {});
            
            let isUpdated = (!!message.modified && !!message.modified.length);
            let date = isUpdated ? message.modified : message.created;

            res.render('message', {
                title: message.title,
                includeJs: ["/js/stackedit.min.js","/js/message.js"],
                includeCss: ["/css/message.css"],
                message: message,
                messageDate: date,
                fromNow: moment.utc(date).fromNow(),
                type: isUpdated ? "modified" : "asked"
            });
        }
    });
    return router;
}

module.exports = Page;
