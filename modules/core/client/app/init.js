'use strict';

// Start by defining the main module and adding the module dependencies.
angular.module(ApplicationConfiguration.applicationModuleName,
               ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode.
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider',
  function($locationProvider) {
    // Enable application to use HTML5 History API.
    $locationProvider.html5Mode(ApplicationConfiguration.html5Mode);
  }
]);

// Define init function for starting up the application.
angular.element(document).ready(function() {
  // Fixing facebook bug with OAuth redirect.
  if (window.location.hash === '#_=_') {
    window.location.hash = '';
  }

  // Initialize application.
  angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});
