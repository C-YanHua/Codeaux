'use strict';

angular.module('users').controller('ProfileIssuesController', ['$scope', 'Users', 'Authentication',
  function($scope, Users, Authentication) {
    $scope.authentication = Authentication;
  }
]);
