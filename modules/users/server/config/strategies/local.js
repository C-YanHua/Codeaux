'use strict';

// Module dependencies.
var passport = require('passport');
var path = require('path');
var User = require('mongoose').model('User');
var LocalStrategy = require('passport-local').Strategy;

var errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/*
 * Application local authentication mechanism.
 */
module.exports = function() {
  passport.use(new LocalStrategy({
      usernameField: 'username',
      passwordField: 'password'
    },
    function(username, password, done) {
      // Validate username exists.
      User.findOne({username: username}, function(err, user) {
        if (user) {
          // Validate input password matches against the database.
          if (user.authenticate(password)) {
            return done(null, user);
          }
        }

        return done(null, false, errorHandler.getErrorResponse(503));
      });
    }
  ));
};
