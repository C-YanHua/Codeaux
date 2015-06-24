'use strict';

// Initialize environment variables and environment files.
require('dotenv').load();
require('./config/init')();

// Module dependencies.
var config = require('./config/config');
var mongoose = require('mongoose');
var chalk = require('chalk');

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

// Bootstrap db connection.
var db = mongoose.connect(config.db, function(err) {
  if (err) {
    console.error(chalk.red('Could not connect to MongoDB!'));
    console.log(chalk.red(err));
  }
});

// Init express HTTP application.
var app = require('./config/express')(db);

// Bootstrap passport config.
require('./config/passport')();

// Start the app by listening on <port>.
app.listen(config.port);

// Expose app.
exports = module.exports = app;

// Logging initialization.
console.log('Codeaux started on port ' + config.port);
