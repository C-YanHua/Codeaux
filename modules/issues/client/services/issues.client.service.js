'use strict';

//Issues service used to communicate Issues REST endpoints.
angular.module('issues').factory('Issues', ['$resource',
  function($resource) {
    return $resource('api/issues/:issueId', {
      issueId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
