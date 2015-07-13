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
    uri: 'mongodb://localhost/codeaux-dev',
    options: {
      user: process.env.DB_USERNAME || '',
      pass: process.env.DB_PASSWORD || ''
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
