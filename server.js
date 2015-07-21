'use strict';

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

// Module dependencies.
var chalk = require('chalk');
var config = require('./config/config');
var express = require('./config/lib/express');
var mongoose = require('./config/lib/mongoose');

// Initialize mongoose connection.
mongoose.connect(function(db) {
  // Initialize express middleware.
  var app = express.init(db);

  // Start the app by listening on <port>.
  app.listen(config.port);

  // Logging initialization
  console.log('--');
  console.log(chalk.green(config.app.title));
  console.log(chalk.green('Environment:\t\t\t' + process.env.NODE_ENV));
  console.log(chalk.green('Port:\t\t\t\t' + config.port));
  console.log(chalk.green('Database:\t\t\t\t' + config.db.uri));

  if (config.secure === true) {
    console.log(chalk.green('HTTPs:\t\t\t\ton'));
  }
  console.log('--');

});
