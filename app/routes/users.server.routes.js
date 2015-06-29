'use strict';

// Module dependencies.
var passport = require('passport');

module.exports = function(app) {
  // User Routes.
  var users = require('../../app/controllers/users.server.controller');

  app.route('/auth/signup_validate/username').post(users.signupValidation);
  app.route('/auth/signup_validate/email').post(users.signupValidation);
  app.route('/auth/signup_validate/password').post(users.signupValidation);

  // Setting up the Users Authentication API.
  app.route('/auth/signup').post(users.signup);
  app.route('/auth/signin').post(users.signin);
  app.route('/auth/signout').get(users.signout);

  // Setting up the Users Profile API.
  app.route('/api/users/me').get(users.me);
  app.route('/api/users').put(users.update);
  app.route('/api/users/accounts').delete(users.removeOAuthProvider);

  // Setting up the Users Password API.
  app.route('/api/users/password').post(users.changePassword);
  app.route('/auth/forgot').post(users.forgot);
  app.route('/auth/reset/:token').get(users.validateResetToken);
  app.route('/auth/reset/:token').post(users.reset);

  // Setting the facebook oauth routes.
  app.route('/auth/facebook').get(passport.authenticate('facebook', {
    scope: ['email']
  }));
  app.route('/auth/facebook/callback').get(users.oauthCallback('facebook'));

  // Setting the google oauth routes.
  app.route('/auth/google').get(passport.authenticate('google', {
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ]
  }));
  app.route('/auth/google/callback').get(users.oauthCallback('google'));

  // Setting the github oauth routes.
  app.route('/auth/github').get(passport.authenticate('github'));
  app.route('/auth/github/callback').get(users.oauthCallback('github'));

  // Setting the nus_openid oauth routes.
  app.route('/auth/nus_openid').get(passport.authenticate('nus-openid'));
  app.route('/auth/nus_openid/return').get(users.openIdReturn('nus-openid'));

  // Finish by binding the user middleware.
  app.param('userId', users.userByID);
};
