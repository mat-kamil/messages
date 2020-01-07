import * as express from 'express';
import {ApiMessage} from "./api/message";
import {ApiComment} from "./api/comment";
import * as jwt from "jsonwebtoken";
import {ApiAuth} from "./api/auth";

/**
 * Api module for all API URL endpoints
 * @param router express.Router
 */
export class Api {
    public router = express.Router();
    private auth: ApiAuth;
    private comment: ApiComment;
    private message: ApiMessage;
    public static secretKey = "MIICXgIBAAKBgQDo1VYRClAu/ukeRnOBgvWRAnyjVdnkUg1Nz5qWN/++SNFd0ihb\n" +
        "Xze/auAipEyOtSAzFt+3dxBBVUBs9pcKWyyjmaQvW3w4b8vO+Gl7zTAwuxwW5f4O\n" +
        "yp35Qq5xPO59xuVe62T911JAWb9pWKhEJ68+xLIqOcetk8YezMwO4fD/iwIDAQAB\n" +
        "AoGBAJwvD07a9jKwODxg0facnJGrc2Q1oLYx/E6n5nDCG8HPIvKmmP/B/alfzf4u\n" +
        "7FQGWBUtUODG85Z/03nEaElAI85LItqlifX+vupy8jKN/B4lpz0A7NEazx63A9tA\n" +
        "NN9Kxr+iCRiRZ5Z5G88CiRMR7wCCbi+25aBqrv+fivVl+qdBAkEA9b/pY7GsvMrc\n" +
        "dIHUsZAbu5UTySHYySNORGcZqVEd691bYSB7UFKSi0fu41klMob3zogWDXtr6gVB\n" +
        "rWOcMsinGwJBAPKLgWuuYypiyC5qmK1Le005aIFqnJD8Lc4bEo8/Im81X89lgydA\n" +
        "qqtoyqFVATH2f3A5+a7JyR7ucjGYqJ/+YFECQQCS0LltLuukyokULbBU+GQpF/H/\n" +
        "GnJ6D9aldPbWubhnfhImn5IsNXiJL0tflZVsb0fConiSS2b4I3XOUZEyob97AkEA\n" +
        "1/vS7AkG1Z/Rk0PpYahtzH7qyRQfCB0IzRjeliEqkM1+3DkRacr0MF/I0ZHY1p0j\n" +
        "LtTxuuyF5L2BgxjmUFM9gQJARlqDIAfidmCVObj9jeGT2XOPTZ5KuOZSq6DMk9UI\n" +
        "aPhU97fxq5ymDzhUItD2BMG/gRNtYceNs8k8M5EwLgwrNQ==";
    
    constructor() {
        this.auth = new ApiAuth(this.router);
        this.comment = new ApiComment(this.router);
        this.message = new ApiMessage(this.router);
    }
    
    
    /**
     * MIDDLEWARE - checkJwt verifies that the auth token provided is valid
     */
    public static checkJwt = (req, res, next) => {
        const token = <string>req.headers["auth"];
        let jwtPayload;
        
        //Try to validate the token and get data
        try {
            jwtPayload = <any>jwt.verify(token, Api.secretKey);
            res.locals.jwtPayload = jwtPayload;
        } catch (error) {
            res.status(401);
            res.jsonp({ success: false, message:"Please login to edit" });
            res.send();
            return;
        }
        next();
    };
    
    
    /**
     * MIDDLEWARE - checkHtml flags if content has html
     */
    public static checkHtml = (req,res,next) => {
        let data = req.body;
        
        if(/<\/?[a-z][\s\S]*>/i.test(data.content)){
            res.status(401);
            res.jsonp({ success:false, message:"Your message contains html input. Saving is forbidden." });
            return;
        }
        next();
    };
}
