'use strict';

// Module dependencies.
var bodyParser = require('body-parser');
var compression = require('compression');
var config = require('../config');
var consolidate = require('consolidate');
var cookieParser = require('cookie-parser');
var express = require('express');
var favicon = require('serve-favicon');
var flash = require('connect-flash');
var helmet = require('helmet');
var methodOverride = require('method-override');
var morgan = require('morgan');
var multer = require('multer');
var path = require('path');
var session = require('express-session');

var MongoStore = require('connect-mongo')(session);

/**
 * Initialize local variables.
 */
var initLocalVariables = function(app) {
  // Setting application local variables. Persists throughout the life of the application.
  app.locals.title = config.app.title;
  app.locals.description = config.app.description;
  app.locals.keywords = config.app.keywords;
  app.locals.googleAnalyticsTrackingID = config.app.googleAnalyticsTrackingID;
  app.locals.facebookAppId = config.facebook.clientID;
  app.locals.jsFiles = config.files.client.js;
  app.locals.cssFiles = config.files.client.css;

  // Passing request URL to environment locals.
  app.use(function(req, res, next) {
    res.locals.host = req.protocol + '://' + req.hostname;
    res.locals.url = req.protocol + '://' + req.headers.host + req.originalUrl;
    next();
  });
};

/**
 * Initialize application middleware.
 */
var initMiddleware = function(app) {
  // Showing stack errors on screen. False for all environment except development.
  app.set('showStackError', false);

  // Enable jsonp.
  app.enable('jsonp callback');

  // Place this before express.static.
  app.use(compression({
    // Compress files of the following content type.
    filter: function(req, res) {
      return (/json|text|javascript|css|font|svg/).test(res.getHeader('Content-Type'));
    },
    // Compression level.
    level: 3
  }));

  // Initialize favicon middleware.
  app.use(favicon('./modules/core/client/img/brand/favicon.ico'));

  // Environment variable dependent middleware.
  if (process.env.NODE_ENV === 'development') {
    // Enable logger (morgan).
    app.use(morgan('dev'));

    // Disable views cache.
    app.set('view cache', false);

    // Enable stack errors on screen.
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

  // Initialize cookie parser and flash middleware.
  app.use(cookieParser());
  app.use(flash());

  // Add multi-part handling middleware.
  app.use(multer({
    dest: './uploads/',
    inMemory: true
  }));
};

/**
 * Initialize view engine.
 */
var initViewEngine = function(app) {
  // Set template engine: [swig].
  app.engine('server.view.html', consolidate[config.templateEngine]);

  // Set server views path and view engine.
  app.set('view engine', 'server.view.html');
  app.set('views', './');
};

/**
 * Initialize express session.
 */
var initSession = function(app, db) {
  // Express MongoDB session storage.
  app.use(session({
    saveUninitialized: true,
    resave: true,
    secret: config.sessionSecret,
    store: new MongoStore({
      mongooseConnection: db.connection,
      collection: config.sessionCollection
    })
  }));
};

/**
 * Initialize server configuration.
 */
var initModulesConfiguration = function(app, db) {
  config.files.server.configs.forEach(function(configPath) {
    require(path.resolve(configPath))(app, db);
  });
};

/**
 * Initialize Helmet headers configuration.
 */
var initHelmetHeaders = function(app) {
  // Use helmet to secure Express headers.
  app.use(helmet.xframe());
  app.use(helmet.xssFilter());
  app.use(helmet.nosniff());
  app.use(helmet.ienoopen());
  app.disable('x-powered-by');
};

/**
 * Initialize client static routes.
 */
var initModulesClientRoutes = function(app) {
  // Setting the app router and static folder.
  app.use('/', express.static(path.resolve('./public')));

  // Globbing static routes.
  config.folders.client.forEach(function(staticPath) {
    app.use(staticPath.replace('/client', ''), express.static(path.resolve('./' + staticPath)));
  });
};

/**
 * Initialize server ACL policies.
 */
var initModulesServerPolicies = function() {
  // Globbing policy files.
  config.files.server.policies.forEach(function(policyPath) {
    require(path.resolve(policyPath)).invokeRolesPolicies();
  });
};

/**
 * Initialize server routes.
 */
var initModulesServerRoutes = function(app) {
  // Globbing server routing files.
  config.files.server.routes.forEach(function(routePath) {
    require(path.resolve(routePath))(app);
  });
};

/**
 * Initialize error handling routes.
 */
var initErrorRoutes = function(app) {
  app.use(function(err, req, res, next) {
    // If the error object doesn't exists.
    if (!err) {
      return next();
    }

    // Log error.
    console.error(err.stack);

    // Redirect to error page.
    res.redirect('/server-error');
  });
};

/**
 * Configure socket.io.
 */
var configureSocketIO = function(app, db) {
  // Load socket.io configuration.
  var server = require('./socket.io')(app, db);

  return server;
};

/**
 * Initialize express application.
 */
module.exports.init = function(db) {
  // Initialize express app.
  var app = express();

  initLocalVariables(app);

  initMiddleware(app);
  initViewEngine(app);
  initSession(app, db);
  initModulesConfiguration(app, db);
  initHelmetHeaders(app);

  initModulesClientRoutes(app);
  initModulesServerPolicies();
  initModulesServerRoutes(app);
  initErrorRoutes(app);

  app = configureSocketIO(app, db);

  return app;
};
