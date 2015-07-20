'use strict';

angular.module('users').controller('ProfileFriendsController', ['$scope', 'Users', 'Authentication',
  function($scope, Users, Authentication) {
    $scope.authentication = Authentication;
  }
]);
