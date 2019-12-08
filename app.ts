const createError = require('http-errors');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const sassMiddleware = require('node-sass-middleware');
const cors = require('cors');
const helmet = require('helmet');
const hbs  = require('hbs');

const Page = require('./routes/page');
const Api = require('./routes/api');
const Seeder = require('./includes/seeder');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerHelper('raw', function(options){
  return options.fn(this);
});
hbs.registerHelper("join", function(context, block) {
  return context.join(block.hash.delimiter);
});

const router = express.Router();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(helmet());
app.use(cookieParser());
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: false, // true = .sass and false = .scss
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

const pageRouter = new Page(router);
const apiRouter = new Api(router);
app.use('/', pageRouter);
app.use('/api', apiRouter);

const seeder = new Seeder();
seeder.seed();

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

let port = process.env.PORT || '1975';
app.listen(port, () => {
  console.log(`Server started on port ${port}!`);
});
