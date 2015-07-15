'use strict';

// Module dependencies.
var _ = require('lodash');
var defaultAssets = require('./config/assets/default');
var testAssets = require('./config/assets/test');

module.exports = function(grunt) {
  // Project Configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    env: {
      test: {
        NODE_ENV: 'test',
        src: 'codeaux.env.json'
      },
      dev: {
        NODE_ENV: 'development',
        src: 'codeaux.env.json'
      },
      prod: {
        NODE_ENV: 'production',
        src: 'codeaux.env.json'
      }
    },
    watch: {
      serverViews: {
        files: defaultAssets.server.views,
        options: {
          livereload: true
        }
      },
      serverJS: {
        files: defaultAssets.server.allJS,
        tasks: ['jshint', 'jscs'],
        options: {
          livereload: true
        }
      },
      clientViews: {
        files: defaultAssets.client.views,
        options: {
          livereload: true,
        }
      },
      clientJS: {
        files: defaultAssets.client.js,
        tasks: ['jshint', 'jscs'],
        options: {
          livereload: true
        }
      },
      clientCSS: {
        files: defaultAssets.client.css,
        tasks: ['csslint'],
        options: {
          livereload: true
        }
      },
      clientSCSS: {
        files: defaultAssets.client.sass,
        tasks: ['sass', 'csslint'],
        options: {
          livereload: true
        }
      },
      clientLESS: {
        files: defaultAssets.client.less,
        tasks: ['less', 'csslint'],
        options: {
          livereload: true
        }
      }
    },
    concurrent: {
      default: ['nodemon', 'watch'],
      debug: ['nodemon', 'watch', 'node-inspector'],
      options: {
        logConcurrentOutput: true,
      }
    },
    csslint: {
      options: {
        csslintrc: '.csslintrc',
      },
      all: {
        src: defaultAssets.client.css
      }
    },
    cssmin: {
      combine: {
        files: {
          'public/dist/application.min.css': defaultAssets.client.css
        }
      }
    },
    jscs: {
      all: {
        src: _.union(defaultAssets.server.allJS, defaultAssets.client.js,
                     testAssets.tests.server, testAssets.tests.client, testAssets.tests.e2e),
        options: {
          config: '.jscsrc',
          verbose: true
        }
      }
    },
    jshint: {
      all: {
        src: _.union(defaultAssets.server.allJS, defaultAssets.client.js,
                     testAssets.tests.server, testAssets.tests.client, testAssets.tests.e2e),
        options: {
          jshintrc: true,
          node: true,
          mocha: true,
          jasmine: true
        }
      }
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js'
      }
    },
    less: {
      dist: {
        files: [{
          expand: true,
          src: defaultAssets.client.less,
          ext: '.css',
          rename: function(base, src) {
            return src.replace('/less/', '/css/');
          }
        }]
      }
    },
    mochaTest: {
      src: testAssets.tests.server,
      options: {
        reporter: 'spec',
        require: 'server.js'
      }
    },
    ngAnnotate: {
      production: {
        files: {
          'public/dist/application.js': defaultAssets.client.js
        }
      }
    },
    nodemon: {
      dev: {
        script: 'server.js',
        options: {
          nodeArgs: ['--debug'],
          ext: 'js,html',
          watch: _.union(defaultAssets.server.views, defaultAssets.server.allJS, defaultAssets.server.config)
        }
      }
    },
    'node-inspector': {
      custom: {
        options: {
          'web-port': 1337,
          'web-host': 'localhost',
          'debug-port': 5858,
          'save-live-edit': true,
          'no-preload': true,
          'stack-trace-limit': 50,
          'hidden': []
        }
      }
    },
    protractor: {
      options: {
        configFile: 'protractor.conf.js',
        keepAlive: true,
        noColor: false
      },
      e2e: {
        options: {
          // Target specific arguments.
          args: {}
        }
      }
    },
    sass: {
      dist: {
        files: [{
          expand: true,
          src: defaultAssets.client.sass,
          ext: '.css',
          rename: function(base, src) {
            return src.replace('/scss/', '/css/');
          }
        }]
      }
    },
    uglify: {
      production: {
        options: {
          mangle: false
        },
        files: {
          'public/dist/application.min.js': 'public/dist/application.js'
        }
      }
    }
  });

  // Load NPM tasks
  require('load-grunt-tasks')(grunt);
  // Making grunt default to force in order not to break the project.
  grunt.option('force', true);

  // A Task for loading the configuration object
  grunt.task.registerTask('mongoose', 'Connects to MongoDB instance and loads the application models.', function() {
    // Get callback.
    var callback = this.async();

    // Use mongoose configuration to connect to mongo database.
    var mongoose = require('./config/lib/mongoose.js');
    mongoose.connect(function() {
      callback();
    });
  });

  // Lint CSS and JavaScript files.
  grunt.registerTask('lint', ['sass', 'less', 'jshint', 'csslint', 'jscs']);

  // Build application files and minify them into two production files.
  grunt.registerTask('build', ['env:dev', 'lint', 'ngAnnotate', 'uglify', 'cssmin']);

  // Run application in testing stage.
  grunt.registerTask('test', ['env:test', 'mongoose', 'mochaTest', 'karma:unit']);
  grunt.registerTask('test:server', ['env:test', 'mongoose', 'mochaTest']);
  grunt.registerTask('test:client', ['env:test', 'mongoose', 'karma:unit']);

  // Run application in development stage.
  grunt.registerTask('default', ['env:dev', 'lint', 'concurrent:default']);

  // Run application in debug stage.
  grunt.registerTask('debug', ['env:dev', 'lint', 'concurrent:debug']);

  // Run application in production stage.
  grunt.registerTask('prod', ['build', 'env:prod', 'concurrent:default']);

  grunt.registerTask('heroku:production', ['build', 'env:prod', 'concurrent:default']);
};
