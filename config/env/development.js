'use strict';

/*
 * Development stage configurations.
 */
module.exports = {
  app: {
    title: 'Codeaux - Development Environment',
    description: 'Codeaux Development Stage'
  },

  db: {
    uri: process.env.LOCALDB_DEVELOPMENT_URI,
    options: {
      user: process.env.LOCALDB_USERNAME || '',
      pass: process.env.LOCALDB_PASSWORD || ''
    }
  },

  log: {
    // Can specify either: 'combined', 'common', 'dev', 'short', 'tiny'
    format: 'dev',
    options: {
      //stream: 'codeaux_access.log'
    }
  }
};
