'use strict';

angular.module('users').controller('ProfileController', ['$scope', '$stateParams', 'UserProfile', 'Authentication',
  function($scope, $stateParams, UserProfile, Authentication) {
    $scope.authentication = Authentication;

    $scope.findOne = function() {
      $scope.profile = UserProfile.get({username: $stateParams.username});
    };
  }
]);
