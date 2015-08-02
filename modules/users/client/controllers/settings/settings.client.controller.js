'use strict';

angular.module('users').controller('SettingsController', ['$scope', '$http', '$state', 'Users', 'Authentication',
  function($scope, $http, $state, Users, Authentication) {
    $scope.user = Authentication.user;

    // If user is not signed in then redirect back home.
    if (!$scope.user) {
      $state.go('home');
    }
  }
]);
