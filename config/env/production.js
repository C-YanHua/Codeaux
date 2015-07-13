'use strict';

/*
 * Production stage configurations.
 */
module.exports = {
  db: {
    uri: process.env.MONGOLAB_URI || 'mongodb://' + (process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost') + '/codeaux',
    options: {
      user: process.env.DB_USERNAME || '',
      pass: process.env.DB_PASSWORD || ''
    }
  },

  log: {
    // Can specify either: 'combined', 'common', 'dev', 'short', 'tiny'
    format: 'combined',
    options: {
      stream: 'codeaux_access.log'
    }
  },

  port: process.env.PORT || 8443,
  secure: true
};
