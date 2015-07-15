'use strict';

/*
 * Production stage configurations.
 */
module.exports = {
  db: {
    uri: process.env.MONGOLAB_URI,
    options: {
      user: process.env.MONGOLAB_USERNAME,
      pass: process.env.MONGOLAB_PASSWORD
    }
  },

  log: {
    // Can specify either: 'combined', 'common', 'dev', 'short', 'tiny'
    format: 'combined',
    options: {
      stream: 'codeaux_access.log'
    }
  },

  port: process.env.PORT || 80,
  secure: false
};
