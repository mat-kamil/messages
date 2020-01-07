import * as express from 'express';
import * as path from 'path';
import * as logger from 'morgan';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as sassMiddleware from 'node-sass-middleware';
import * as cors from 'cors';
import * as helmet from 'helmet';
import * as createError from 'http-errors';

import { Seeder } from '../includes/seeder';
import { ViewHbs } from "./view/hbs";
import { Api } from "./api";
import { Page } from "./page";

export class App {
    public app: express.Application;
    public port: string;
    public viewController: ViewHbs;
    
    constructor(port?: string) {
        this.app = express();
        this.port = process.env.PORT || port || '1975';
        
        this.setupView();
        this.setupMiddlewares();
        this.setupControllers();
        
        (new Seeder()).seed();
        this.setupErrors();
    }
    
    private setupView = () => {
        this.viewController = new ViewHbs(this.app);
    };
    
    private setupMiddlewares = () => {
        this.app.use(logger('dev'));
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: false }));
        this.app.use(cors());
        this.app.use(helmet());
        this.app.use(cookieParser());
        this.app.use(sassMiddleware({
            src: path.join(__dirname, '../public'),
            dest: path.join(__dirname, '../public'),
            indentedSyntax: false, // true = .sass and false = .scss
            sourceMap: true
        }));
        this.app.use(express.static(path.join(__dirname, '../public')));
    
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({extended: false}));
    };
    
    private setupControllers = () => {
        this.app.use('/', (new Api).router);
        this.app.use('/', (new Page).router);
    };
    
    private setupErrors = () => {
        // catch 404 and forward to error handler
        this.app.use(function(req, res, next) {
            next(createError(404));
        });

        // error handler
        this.app.use(function(err, req, res, next) {
            // set locals, only providing error in development
            res.locals.message = err.message;
            res.locals.error = req.app.get('env') === 'development' ? err : {};
        
            // render the error page
            res.status(err.status || 500);
            res.render('error', {title:"Error!"});
        });
    };
    
    public listen = () => {
        this.app.listen(this.port, ()=>{
            console.log(`Server started on port ${this.port}!`);
        });
    }
}
