'use strict';

angular.module('users').controller('ProfileController', ['$scope', '$stateParams', '$state',
                                                         'UserProfile', 'Authentication',
  function($scope, $stateParams, $state, UserProfile, Authentication) {
    $scope.authentication = Authentication;

    $scope.profile = {};
    $scope.findOne = function() {
      var profile = UserProfile.get({username: $stateParams.username});
      $scope.profile = profile;
    };

    $state.go('profile.friends');
  }
]);
