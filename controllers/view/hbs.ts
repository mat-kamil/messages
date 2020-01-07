import * as express from 'express';
import * as path from 'path';
import * as hbs from 'hbs';
import * as moment from 'moment';

export class ViewHbs {
    public app: express.Application;
    public view: hbs;
    
    constructor(app) {
        this.app = app;
        app.set('views', path.join(__dirname, '../../views'));
        app.set('view engine', 'hbs');
        this.view = hbs;
        this.registerHelpers();
    }
    
    registerHelpers = () => {
        this.view.registerHelper('raw', function(options){
            return options.fn(this);
        });
        this.view.registerHelper('fromNow', function(str){
            return moment.utc(str).fromNow();
        });
        // http://doginthehat.com.au/2012/02/comparison-block-helper-for-handlebars-templates/
        let operators = {
            '==':       function(l,r) { return l == r; },
            '===':      function(l,r) { return l === r; },
            '!=':       function(l,r) { return l != r; },
            '<':        function(l,r) { return l < r; },
            '>':        function(l,r) { return l > r; },
            '<=':       function(l,r) { return l <= r; },
            '>=':       function(l,r) { return l >= r; },
            'typeof':   function(l,r) { return typeof l == r; }
        };
        this.view.registerHelper('compare', function(lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
        
            let operator = options.hash.operator || "==";
            if (!operators[operator])
                throw new Error("Handlerbars Helper 'compare' doesn't know the operator "+operator);
            if( operators[operator](lvalue,rvalue) ) {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }
        });
        this.view.registerHelper("join", function(context, block) {
            return context.join(block.hash.delimiter);
        });
        this.view.registerHelper("json", function(context) {
            return JSON.stringify(context);
        });
    }
}

