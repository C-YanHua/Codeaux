/*jshint camelcase: false*/
//jscs:disable requireCamelCaseOrUpperCaseIdentifiers
'use strict';

// Module dependencies.
var passport = require('passport');
var users = require('../../controllers/users.server.controller');
var GithubStrategy = require('passport-github').Strategy;

/*
 * Github OAuth Strategy.
 */
module.exports = function(config) {
  passport.use(new GithubStrategy({
      clientID: config.github.clientID,
      clientSecret: config.github.clientSecret,
      callbackURL: config.github.callbackUrl,
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
        username: profile.username,
        imageUrl: (providerData.avatar_url) ? providerData.avatar_url : undefined,
        provider: 'github',
        providerIdentifierField: 'id',
        providerData: providerData
      };

      // Save the user OAuth profile.
      users.saveOAuthUserProfile(req, providerUserProfile, done);
    }
  ));
};
