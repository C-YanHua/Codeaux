'use strict';

// Module dependencies.
var passport = require('passport');
var users = require('../../controllers/users.server.controller');
var FacebookStrategy = require('passport-facebook').Strategy;

/*
 * Facebook OAuth Strategy.
 */
module.exports = function(config) {
  passport.use(new FacebookStrategy({
      clientID: config.facebook.clientID,
      clientSecret: config.facebook.clientSecret,
      callbackURL: config.facebook.callbackUrl,
      profileFields: ['id', 'displayName', 'emails', 'photos'],
      passReqToCallback: true
    },
    function(req, accessToken, refreshToken, profile, done) {
      // Set the provider data and include tokens.
      var providerData = profile._json;
      providerData.accessToken = accessToken;
      providerData.refreshToken = refreshToken;

      // Create the user OAuth profile.
      var providerUserProfile = {
        name: profile.displayName,
        email: profile.emails[0].value,
        imageUrl: (profile.id) ? '//graph.facebook.com/' + profile.id + '/picture?type=large' : undefined,
        provider: 'facebook',
        providerIdentifierField: 'id',
        providerData: providerData
      };

      // Save the user OAuth profile.
      users.saveOAuthUserProfile(req, providerUserProfile, done);
    }
  ));
};
