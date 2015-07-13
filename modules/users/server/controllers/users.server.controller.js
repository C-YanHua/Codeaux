'use strict';

// Module dependencies.
var _ = require('lodash');

/*
 * Extend users controller.
 */
module.exports = _.extend(
  require('./users/users.authentication.server.controller'),
  require('./users/users.authorization.server.controller'),
  require('./users/users.password.server.controller'),
  require('./users/users.profile.server.controller')
);
