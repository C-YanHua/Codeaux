'use strict';

// Module dependencies.
var chalk = require('chalk');
var config = require('../config');
var mongoose = require('mongoose');
var path = require('path');

// Load mongoose models.
var loadModels = function() {
  // Globbing model files.
  config.files.server.models.forEach(function(modelPath) {
    require(path.resolve(modelPath));
  });
};

// Initialize Mongoose
module.exports.connect = function(callback) {
  var db = mongoose.connect(config.db.uri, config.db.options, function(err) {
    // Log database error.
    if (err) {
      console.error(chalk.red('Could not connect to MongoDB!'));
      console.log(err);
    } else {
      // Load modules
      loadModels();

      if (callback) {
        callback(db);
      }
    }
  });
};

module.exports.disconnect = function(callback) {
  mongoose.disconnect(function(err) {
    console.info(chalk.yellow('Disconnected from MongoDB.'));
    callback(err);
  });
};
