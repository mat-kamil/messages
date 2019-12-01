/**
 * Page module for all page URL endpoints
 * @param router express.Router
 * @returns router express.Router
 */
function Page(router){
    /* GET home page. */
    router.get('/', function(req, res, next) {
        res.render('index', { title: 'MuzMessage | Homepage' });
    });

    return router;
}

module.exports = Page;
