'use strict';

// Authentication service for user variables.
angular.module('users').factory('Authentication', ['$window',
  function($window) {
    var authentication = {user: $window.user};

    return authentication;
  }
]);
