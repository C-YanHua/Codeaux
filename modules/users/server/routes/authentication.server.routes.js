'use strict';

// Module dependencies.
var passport = require('passport');

module.exports = function(app) {
  // User routing.
  var users = require('../controllers/users.server.controller');

  app.route('/api/auth/signup-validate/username').post(users.validateSignupProperty);
  app.route('/api/auth/signup-validate/email').post(users.validateSignupProperty);
  app.route('/api/auth/signup-validate/password').post(users.validateSignupProperty);

  // Setting up the route for Users Authentication.
  app.route('/api/auth/signup').post(users.signup);
  app.route('/api/auth/signin').post(users.signin);
  app.route('/api/auth/signout').get(users.signout);

  app.route('/api/auth/forgot').post(users.forgot);
  app.route('/api/auth/reset/:token').get(users.validateResetToken);
  app.route('/api/auth/reset/:token').post(users.reset);

  // Setting up the route for Facebook OAuth services.
  app.route('/api/auth/facebook').get(passport.authenticate('facebook', {
    scope: ['email']
  }));
  app.route('/api/auth/facebook/callback').get(users.oauthCallback('facebook'));

  // Setting up the route for Google OAuth services.
  app.route('/api/auth/google').get(passport.authenticate('google', {
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ]
  }));
  app.route('/api/auth/google/callback').get(users.oauthCallback('google'));

  // Setting up the route for Github OAuth services.
  app.route('/api/auth/github').get(passport.authenticate('github'));
  app.route('/api/auth/github/callback').get(users.oauthCallback('github'));

  // Setting up the route for NUS OpenID services.
  app.route('/api/auth/nus_openid').get(passport.authenticate('nus-openid'));
  app.route('/api/auth/nus_openid/return').get(users.openIdReturn('nus-openid'));
};
