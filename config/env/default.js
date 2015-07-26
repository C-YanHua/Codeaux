'use strict';

/*
 * Default configurations. If specify in another environment JS file, merge with it.
 */
module.exports = {
  // Default app object configurations for production.
  app: {
    title: 'Codeaux - Default Environment',
    description: 'Codeaux Default',
    keywords: 'Codeaux, Orbital',
    logo: 'modules/core/img/brand/logo_wordmark.png',
    favicon: 'modules/core/img/brand/favicon.ico'
  },

  templateEngine: 'swig',
  sessionSecret: 'MEAN',
  sessionCollection: 'sessions',

  livereload: true,
  secure: false,

  facebook: {
    clientID: process.env.FACEBOOK_ID,
    clientSecret: process.env.FACEBOOK_SECRET,
    callbackUrl: '/api/auth/facebook/callback'
  },
  google: {
    clientID: process.env.GOOGLE_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackUrl: '/api/auth/google/callback'
  },
  github: {
    clientID: process.env.GITHUB_ID,
    clientSecret: process.env.GITHUB_SECRET,
    callbackUrl: '/api/auth/github/callback'
  },

  mailer: {
    from: process.env.MAILER_FROM || 'MAILER_FROM',
    options: {
      service: process.env.MAILER_SERVICE_PROVIDER || 'MAILER_SERVICE_PROVIDER',
      auth: {
        user: process.env.MAILER_EMAIL_ID || 'MAILER_EMAIL_ID',
        pass: process.env.MAILER_PASSWORD || 'MAILER_PASSWORD'
      }
    }
  }
};
