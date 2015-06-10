'use strict';

// Module dependencies.
require('http');

var bodyParser = require('body-parser');
var compress = require('compression');
var config = require('./config');
var consolidate = require('consolidate');
var cookieParser = require('cookie-parser');
var express = require('express');
var flash = require('connect-flash');
var fs = require('fs');
var helmet = require('helmet');
var https = require('https');
var methodOverride = require('method-override');
var morgan = require('morgan');
var passport = require('passport');
var path = require('path');
var session = require('express-session');

var mongoStore = require('connect-mongo') ({
  session: session
});

module.exports = function(db) {
  // Initialize express application.
  var app = express();

  // Globbing all model files.
  config.getGlobbedFiles('./app/models/**/*.js').forEach(function(modelPath) {
    require(path.resolve(modelPath));
  });

  // Setting application local variables.
  // Persists throughout the life of the application.
  app.locals.title = config.app.title;
  app.locals.description = config.app.description;
  app.locals.keywords = config.app.keywords;
  app.locals.facebookAppId = config.facebook.clientID;
  app.locals.jsFiles = config.getJavaScriptAssets();
  app.locals.cssFiles = config.getCSSAssets();

  // Set template engine: [swig].
  app.engine('server.view.html', consolidate[config.templateEngine]);

  // Set server views path and view engine.
  app.set('view engine', 'server.view.html');
  app.set('views', './app/views');

  // Passing the request url to environment locals.
  app.use(function(req, res, next) {
    res.locals.url = req.protocol + '://' + req.headers.host + req.url;
    next();
  });

  // Should be placed before express.static.
  app.use(compress({
    filter: function(req, res) {
      return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
    },
    level: 9
  }));

  // Showing stack errors on screen. False for all ENV except development.
  app.set('showStackError', false);

  // Environment dependent middleware.
  if (process.env.NODE_ENV === 'development') {
    // Enable logger (morgan).
    app.use(morgan('dev'));

    // Disable views cache.
    app.set('view cache', false);

    app.set('showStackError', true);
  } else if (process.env.NODE_ENV === 'production') {
    app.locals.cache = 'memory';
  }

  // Request body parsing middleware should be above methodOverride.
  // If not, req.body will not be populated.
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  // Parser accepts any Unicode encoding of the body.
  // Supports automatic inflation of gzip and deflate encodings.
  app.use(bodyParser.json());
  app.use(methodOverride());

  // CookieParser should be above session
  app.use(cookieParser());

  // Express MongoDB session storage.
  app.use(session({
    saveUninitialized: true,
    resave: true,
    secret: config.sessionSecret,
    store: new mongoStore({
      mongooseConnection: db.connection,
      collection: config.sessionCollection
    })
  }));

  // use passport session
  app.use(passport.initialize());
  app.use(passport.session());

  // connect flash for flash messages
  app.use(flash());

  // Setting the app router and static folder
  app.use(express.static(path.resolve('./public')));

  // Globbing routing files.
  config.getGlobbedFiles('./app/routes/**/*.js').forEach(function(routePath) {
    require(path.resolve(routePath))(app);
  });

  // Assume 'not found' in the error msgs is a 404.
  // Alternative: use set properties, use instanceof, etc.
  app.use(function(err, req, res, next) {
    // If the error object doesn't exists
    if (!err) {
      return next();
    }

    // Log it
    console.error(err.stack);

    // Error page
    res.status(500).render('500', {
      error: err.stack
    });
  });

  // Assume 404 since no middleware responded
  app.use(function(req, res) {
    res.status(404).render('404', {
      url: req.originalUrl,
      error: 'Not Found'
    });
  });

  // Use helmet to secure Express headers.
  app.use(helmet.xframe());
  app.use(helmet.xssFilter());
  app.use(helmet.nosniff());
  app.use(helmet.ienoopen());
  app.disable('x-powered-by');

  if (process.env.NODE_ENV === 'secure') {
    // Log SSL usage
    console.log('Securely using https protocol');

    // Load SSL key and certificate
    var privateKey = fs.readFileSync('./config/sslcerts/key.pem', 'utf8');
    var certificate = fs.readFileSync('./config/sslcerts/cert.pem', 'utf8');

    // Create HTTPS Server
    var httpsServer = https.createServer({
      key: privateKey,
      cert: certificate
    }, app);

    // Return HTTPS server instance
    return httpsServer;
  }

  // Return Express server instance
  return app;
};
