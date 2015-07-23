'use strict';

angular.module('core').controller('HomeController', ['$scope', '$state', 'Authentication',
  function($scope, $state, Authentication) {
    // This provides Authentication context.
    $scope.authentication = Authentication;

    // If client is authenticated, direct to main page.
    if (Authentication.user) {
      $state.go('home.main');
    } else {
      $state.go('home.landing');
    }
  }
]);
