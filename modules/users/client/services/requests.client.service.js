'use strict';

//Friend request service used to communicate friend-request REST endpoints.
angular.module('users').factory('Requests', ['$resource',
  function($resource) {
    return $resource('api/requests', {}, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
