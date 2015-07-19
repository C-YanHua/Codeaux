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
  secure: false,

  etherpad: {
    host: process.env.ETHERPAD_PRODUCTION_HOST,
    port: parseInt(process.env.ETHERPAD_PRODUCTION_PORT),
    apikey: process.env.ETHERPAD_PRODUCTION_APIKEY
  },

  nusOpenId: {
    realm: process.env.PRODUCTION_URL,
    returnUrl: process.env.PRODUCTION_URL + '/api/auth/nus_openid/return'
  },
};
