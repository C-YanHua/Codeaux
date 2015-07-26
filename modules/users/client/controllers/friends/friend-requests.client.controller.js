'use strict';

angular.module('users').controller('FriendRequestsController', ['$scope', '$stateParams', '$http', '$location',
                                                          'Authentication',
  function($scope, $stateParams, $http, $location, Authentication) {
    $scope.authentication = Authentication;

    console.log("This is the friend-requests controller speaking...");

  }
]);
