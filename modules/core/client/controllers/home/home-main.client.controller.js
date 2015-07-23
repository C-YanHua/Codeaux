'use strict';

angular.module('core').controller('HomeMainController', ['$scope', 'Authentication',
  function($scope, Authentication) {
    // This provides Authentication context.
    $scope.authentication = Authentication;
  }
]);
