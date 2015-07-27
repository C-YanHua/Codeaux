'use strict';

module.exports = function(app) {
  // Request Routing.
  var requests = require('../controllers/requests.server.controller');

  // Get all friend requests for one user
  app.route('/api/requests').get(requests.listForUser);

  // Create new friend request
  app.route('/api/requests').post(requests.create);

};
