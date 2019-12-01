import { Router, Request, Response } from 'express';

/**
 * API module for all api endpoints
 * @param router express.Router
 * @returns router express.Router
 */
function Api(router: Router){

    /* GET users listing. */
    router.get('/auth/login',(req: Request, res: Response) => {
       let data = req.body;
       console.log(data);
    });

    return router;
}

module.exports = Api;
