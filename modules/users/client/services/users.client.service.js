'use strict';

// Users service used for communicating with the users REST endpoint.
angular.module('users').factory('Users', ['$resource',
  function($resource) {
    return $resource('api/users', {}, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

angular.module('users').factory('UserProfile', ['$resource',
  function($resource) {
    return $resource('api/:username', {username: '@username'});
  }
]);

angular.module('users').factory('UserIssues', ['$resource',
  function($resource) {
    return $resource('api/:username/issues', {username: '@username'}, {
      get: {
        method: 'GET',
        isArray: true
      }
    });
  }
]);
