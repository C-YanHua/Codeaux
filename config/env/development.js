'use strict';

module.exports = {
  app: {
    title: 'Codeaux - Development Environment',
    description: 'Codeaux development stage'
  },

  db: 'mongodb://localhost/codeaux-dev',
  port: process.env.PORT || 3000
};
