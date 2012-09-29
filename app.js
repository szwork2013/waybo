var path = require('path');
var express = require('express');
var config = require('./config').config;
var routes = require('./routes');
var partials = require('express-partials');
var ejs = require('ejs');
var appRoot = __dirname;
var app = express();

app.configure('development', function() {
  app.use(partials());
//  app.use(app.router);
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(path.join(appRoot, 'public')));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true}));
  app.set('views', path.join(appRoot, 'views'));
  app.set('views engine', 'html');
  app.set('view cache', false);
  app.engine('html', ejs.renderFile);
  app.locals({config: config});
});

routes(app);

app.listen(config.port);
console.log(config.host + ':' + config.port);

module.exports = app;