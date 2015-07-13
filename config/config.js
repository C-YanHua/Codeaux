'use strict';

// Module dependencies.
var _ = require('lodash');
var chalk = require('chalk');
var glob = require('glob');
var path = require('path');

/**
 * Get files by glob patterns.
 */
var getGlobbedPaths = function(globPatterns, excludes) {
  // URL paths regex.
  var urlRegex = new RegExp('^(?:[a-z]+:)?\/\/', 'i');

  // The output array.
  var output = [];

  // If glob pattern is array, use each pattern in a recursive way, otherwise glob the string.
  if (_.isArray(globPatterns)) {
    globPatterns.forEach(function(globPattern) {
      output = _.union(output, getGlobbedPaths(globPattern, excludes));
    });

  } else if (_.isString(globPatterns)) {
    if (urlRegex.test(globPatterns)) {
      output.push(globPatterns);

    } else {
      var files = glob.sync(globPatterns);

      // Remove root directory name from the files.
      if (excludes) {
        files = files.map(function(file) {
          if (_.isArray(excludes)) {
            for (var i in excludes) {
              file = file.replace(excludes[i], '');
            }
          } else {
            file = file.replace(excludes, '');
          }

          return file;
        });
      }

      output = _.union(output, files);
    }
  }

  return output;
};

/*
 * Validate environment variable existance.
 */
var validateEnvironmentVariable = function() {
  var environmentFiles = glob.sync('./config/env/' + process.env.NODE_ENV + '.js');

  if (!environmentFiles.length) {
    if (process.env.NODE_ENV) {
      console.error(chalk.red('No configuration file found for "' + process.env.NODE_ENV +
                              '" environment using development instead'));
    } else {
      console.error(chalk.red('NODE_ENV is not defined! Using default development environment'));
    }

    process.env.NODE_ENV = 'development';
  }

  // Reset console color.
  console.log(chalk.white(''));
};

/**
 * Initialize global configuration files.
 *
 */
var initGlobalConfigFolders = function(config) {
  // Appending folders.
  config.folders = {
    server: {},
    client: {}
  };

  config.folders.client = getGlobbedPaths(path.join(process.cwd(), 'modules/*/client/'),
                                          process.cwd().replace(new RegExp(/\\/g), '/'));
};

var initGlobalConfigFiles = function(config, assets) {
  // Appending files.
  config.files = {
    server: {},
    client: {}
  };

  // Setting Globbed server files.
  config.files.server.models = getGlobbedPaths(assets.server.models);
  config.files.server.routes = getGlobbedPaths(assets.server.routes);
  config.files.server.configs = getGlobbedPaths(assets.server.config);
  config.files.server.sockets = getGlobbedPaths(assets.server.sockets);
  config.files.server.policies = getGlobbedPaths(assets.server.policies);

  // Setting Globbed client files.
  config.files.client.js = getGlobbedPaths(assets.client.lib.js, 'public/').
                           concat(getGlobbedPaths(assets.client.js, ['client/', 'public/']));
  config.files.client.css = getGlobbedPaths(assets.client.lib.css, 'public/').
                            concat(getGlobbedPaths(assets.client.css, ['client/', 'public/']));

  config.files.client.tests = getGlobbedPaths(assets.client.tests);
};

/**
 * Initialize global configuration.
 */
var initGlobalConfig = function() {
  // Validate NODE_ENV existance.
  validateEnvironmentVariable();

  // Get default and environment assets.
  var defaultAssets = require(path.join(process.cwd(), 'config/assets/default'));
  var environmentAssets = require(path.join(process.cwd(), 'config/assets/', process.env.NODE_ENV)) || {};

  // Merge assets.
  var assets = _.extend(defaultAssets, environmentAssets);

  // Get default and environment config.
  var defaultConfig = require(path.join(process.cwd(), 'config/env/default'));
  var environmentConfig = require(path.join(process.cwd(), 'config/env/', process.env.NODE_ENV)) || {};

  // Merge config.
  var config = _.merge(defaultConfig, environmentConfig);

  // Initialize Global files and folders.
  initGlobalConfigFiles(config, assets);
  initGlobalConfigFolders(config, assets);

  // Express configuration utilities.
  config.utils = {
    getGlobbedPaths: getGlobbedPaths
  };

  return config;
};

/*
 * Export configuration object.
 */
module.exports = initGlobalConfig();
