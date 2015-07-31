'use strict';

/*
 * User routing.
 */
module.exports = function(app) {
  var users = require('../controllers/users.server.controller');

  app.route('/api/users')
    // Search for users matching a search string.
    .get(users.search)
    .put(users.updateProfile);

  // Setting up the Users Profile API.
  app.route('/api/:username').get(users.read);

  app.route('/api/users/accounts').delete(users.removeOAuthProvider);
  app.route('/api/users/password').post(users.changePassword);
  app.route('/api/users/picture').post(users.changeProfilePicture);

  app.route('/api/users/addFriend').post(users.addFriend);
  app.route('/api/users/removeFriend').post(users.removeFriend);
  app.route('/api/users/searchFriends').get(users.searchFriends);

  // Finish by binding the user middleware.
  app.param('username', users.userByUsername);
};
