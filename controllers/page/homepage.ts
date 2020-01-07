import * as express from 'express';

export class PageHomepage {
    public router: express.Router;
    constructor(router: express.Router) {
        this.router = router;
        router.use('/', this.getPage);
    }
    
    /** GET home page.
     *  This is the default page (/)
     */
    private getPage = (req, res, next) => {
        console.log("wtf");
        res.render('index', { title: 'MuzMessage' });
    };
}
