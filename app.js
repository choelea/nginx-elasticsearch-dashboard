var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('hbs');
var helpers = require('handlebars-helpers');
var indexRouter = require('./routes/index');
var logViewRouter = require('./routes/logView');
var dslRouter = require('./routes/dslquery');
const favicon = require('express-favicon');
require('./elasticsearchInit')()

var app = express();

console.log('Starting express.......... ')
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
helpers({handlebars: hbs})
hbs.registerPartials(__dirname + '/views/partials');

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/log', logViewRouter);
app.use('/dsl',dslRouter);
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

module.exports = app;
