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
      user: process.env.LOCALDB_USERNAME || '',
      pass: process.env.LOCALDB_PASSWORD || ''
    }
  },

  port: process.env.PORT || 3000,

  log: {
    // Can specify either: 'combined', 'common', 'dev', 'short', 'tiny'
    format: 'dev',
    options: {
      //stream: 'codeaux_access.log'
    }
  },

  etherpad: {
    host: process.env.ETHERPAD_DEVELOPMENT_HOST,
    port: parseInt(process.env.ETHERPAD_DEVELOPMENT_PORT),
    apikey: process.env.ETHERPAD_DEVELOPMENT_APIKEY
  },

  nusOpenId: {
    realm: process.env.DEVELOPMENT_URL,
    returnUrl: process.env.DEVELOPMENT_URL + '/api/auth/nus_openid/return'
  },
};
