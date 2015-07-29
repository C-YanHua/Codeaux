'use strict';

module.exports = function(app) {
  // User Routing.
  var users = require('../controllers/users.server.controller');

  app.route('/api/users').get(users.search);

  // Setting up the Users Profile API.
  app.route('/api/:username').get(users.read);

  app.route('/api/users').put(users.updateProfile);
  app.route('/api/users/accounts').delete(users.removeOAuthProvider);
  app.route('/api/users/password').post(users.changePassword);
  app.route('/api/users/picture').post(users.changeProfilePicture);

  // Finish by binding the user middleware.
  app.param('username', users.userByUsername);
};
