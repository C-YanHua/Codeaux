'use strict';

// Module dependencies.
var passport = require('passport');
var path = require('path');

var config = require(path.resolve('./config/config'));
var User = require('mongoose').model('User');

/*
 * Users server configuration.
 */
module.exports = function(app) {
  // Serialize passport sessions.
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  // Deserialize passport sessions.
  passport.deserializeUser(function(id, done) {
    User.findOne({
      _id: id
    }, '-salt -password', function(err, user) {
      done(err, user);
    });
  });

  // Initialize passport strategies.
  config.utils.getGlobbedPaths(path.join(__dirname, './strategies/**/*.js')).forEach(function(strategy) {
    require(path.resolve(strategy))(config);
  });

  // Add passport middleware.
  app.use(passport.initialize());
  app.use(passport.session());
};
