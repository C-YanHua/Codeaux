'use strict';

// Module dependencies.
var path = require('path');

var config = require(path.resolve('./config/config'));

/**
 * Module init function.
 */
module.exports = function() {
  // Initialize etherpad configurations.
  require('../controllers/etherpad/etherpad.server.controller')(config);
};
