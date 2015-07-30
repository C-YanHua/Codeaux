'use strict';

/*
 * Default assets. If specify in another environment JS file, merge with it.
 */
module.exports = {
  client: {
    lib: {
      // Using Angular Bootstrap instead of standard Bootstrap JavaScript.
      css: [
        'public/lib/animate.css/animate.css',
        'public/lib/bootstrap/dist/css/bootstrap.css',
        'public/lib/bootstrap/dist/css/bootstrap-theme.css',
        'public/lib/bootstrap-social/bootstrap-social.css',
        'public/lib/font-awesome/css/font-awesome.css'
      ],
      js: [
        'public/lib/angular/angular.js',
        'public/lib/angular-animate/angular-animate.js',
        'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
        'public/lib/angular-cookies/angular-cookies.js',
        'public/lib/angular-file-upload/src/module.js',
        'public/lib/angular-messages/angular-messages.js',
        'public/lib/angular-resource/angular-resource.js',
        'public/lib/angular-ui-router/release/angular-ui-router.js',
        'public/lib/angular-ui-utils/ui-utils.js'
      ],
      tests: [
        'public/lib/angular-mocks/angular-mocks.js'
      ]
    },
    css: [
      'modules/*/client/css/*.css'
    ],
    less: [
      'modules/*/client/less/*.less'
    ],
    sass: [
      'modules/*/client/scss/*.scss'
    ],
    js: [
      'modules/core/client/app/config.js',
      'modules/core/client/app/init.js',
      'modules/core/client/*.js',
      'modules/*/client/*.js',
      'modules/*/client/**/*.js'
    ],
    views: [
      'modules/*/client/views/**/*.html'
    ]
  },
  server: {
    grunt: 'Gruntfile.js',
    allJS: ['server.js', 'config/**/*.js', 'modules/*/server/**/*.js'],
    models: 'modules/*/server/models/**/*.js',
    routes: ['modules/*[!core]/server/routes/**/*.js', 'modules/core/server/routes/**/*.js'],
    sockets: 'modules/*/server/sockets/**/*.js',
    config: 'modules/*/server/config/*.js',
    policies: 'modules/*/server/policies/*.js',
    views: 'modules/*/server/views/*.html'
  }
};
