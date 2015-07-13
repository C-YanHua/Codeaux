'use strict';

// Initialize the application configuration module for AngularJS application.
var ApplicationConfiguration = (function() {
  // Initialize module configuration options.
  var applicationModuleName = 'Codeaux';
  var applicationModuleVendorDependencies = ['angularFileUpload', 'ngResource', 'ngCookies', 'ngAnimate',
                                             'ngMessages', 'ui.router', 'ui.bootstrap', 'ui.utils'];

  // Add new vertical module.
  var registerModule = function(moduleName, dependencies) {
    // Create angular module.
    angular.module(moduleName, dependencies || []);

    // Add module to AngularJS configuration file.
    angular.module(applicationModuleName).requires.push(moduleName);
  };

  // Set html5 mode.
  var html5Mode = true;

  return {
    applicationModuleName: applicationModuleName,
    applicationModuleVendorDependencies: applicationModuleVendorDependencies,
    registerModule: registerModule,
    html5Mode: html5Mode
  };
})();
