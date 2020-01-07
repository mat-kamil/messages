import * as express from 'express';
import { PageHomepage } from "./page/homepage";
import { PageMessagePage } from "./page/message";

/**
 * Page module for all page URL endpoints
 * @param router express.Router
 */
export class Page {
    public router = express.Router();
    private homepage: PageHomepage;
    private messagePage: PageMessagePage;
    
    constructor() {
        this.messagePage = new PageMessagePage(this.router);
        this.homepage = new PageHomepage(this.router);
    }
}
