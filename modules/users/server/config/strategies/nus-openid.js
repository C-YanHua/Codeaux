'use strict';

// Module dependencies.
var passport = require('passport');
var users = require('../../controllers/users.server.controller');
var NUSStrategy = require('passport-nus-openid').Strategy;

module.exports = function(config) {
  // Use OpenID Strategy for NUS.
  passport.use(new NUSStrategy({
      returnURL: config.nusOpenId.returnURL,
      realm: config.nusOpenId.realm,
      profile: true,
      passReqToCallback: true
    },

    function(req, identifier, profile, done) {
      var providerUserProfile = {
        name: profile.displayName,
        email: profile.emails[0].value,
        username: identifier.substring(identifier.lastIndexOf('/') + 1),
        provider: 'nus',
        providerIdentifierField: identifier
      };

      // Save the user OpenId profile.
      users.saveOpenIdUserProfile(req, providerUserProfile, done);
    }
  ));
};
