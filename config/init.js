'use strict';

// Module dependencies.
var glob = require('glob');
var chalk = require('chalk');

// Module init function.
module.exports = function() {
  /**
   * Look for NODE_ENV environment variable in the system.
   * If it cannot be found, initialize NODE_ENV to default value.
   */
  var environmentFiles = glob.sync('./config/env/' + process.env.NODE_ENV + '.js');

  if (!environmentFiles.length) {
    if (process.env.NODE_ENV) {
      console.error(chalk.red('No configuration file found for "' + process.env.NODE_ENV +
                              '" environment using development instead'));
    } else {
      console.error(chalk.red('NODE_ENV is not defined! Using default development environment'));
    }

    // Init default value for NODE_ENV.
    process.env.NODE_ENV = 'development';

  } else {
    console.log(chalk.black.bgWhite('Application loaded using the "' + process.env.NODE_ENV +
                                    '" environment configuration'));
  }
};
