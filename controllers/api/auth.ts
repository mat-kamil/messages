import * as express from 'express';
import {Api} from '../api';
import {FrontendUser, LoginData, UserModel} from "../../includes/models";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcryptjs";

export class ApiAuth {
    public router: express.Router;
    constructor(router: express.Router) {
        this.router = router;
        
        router.post('/auth/login',this.login);
        router.get('/auth/logout', this.logout);
        router.get('/encrypt', this.encrypt);
    }
    
    /**
     * POST function to log in. Data submitted must be in JSON format
     * @param req.body.email email address to log into
     * @param req.body.password password for the login email
     */
    private login = async (req, res, next) => {
        let data = req.body;
        // @ts-ignore
        let user = await UserModel.login(<LoginData>data);
        if(!user){
            res.status(401);
            res.jsonp({ success:false, message:"Your credentials are wrong, please try again" });
        }
        //sign JWT, valid for 216 hours (for testing)
        //TODO: reduce login hours?
        let userF = <FrontendUser>{
            id: user._id,
            name: user.name,
            email: user.email,
            nick: user.nick,
            // @ts-ignore
            access: UserModel.getAccess(user),
            img: user.img,
            points: user.points,
        };
        const token = jwt.sign(
            userF,
            Api.secretKey,
            { expiresIn: "216h" }
        );
        res.jsonp({"success":true, "token":token});
    };
    
    
    /**
     * Logout
     * No action is needed as logout is handled by front-end
     */
    private logout = (req,res) => {
        res.jsonp({ success:true });
    };
    
    /**
     * GET helper function to encrypt a password
     * @param req.pass the password
     */
    private encrypt = (req,res,next)=>{
        let pass = req.query.pass;
        res.jsonp({"pass":bcrypt.hashSync(pass, 8),"date":(new Date).toISOString()} )
    };
}
