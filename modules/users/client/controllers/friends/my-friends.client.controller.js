'use strict';

angular.module('users').controller('MyFriendsController', ['$scope', '$stateParams', '$http', '$location',
                                                                'Authentication', '$state',
  function($scope, $stateParams, $http, $location, Authentication, $state) {

    if (!Authentication.user) {
      $state.go('404-page-not-found');
    }

    $scope.statuses = [];
    $http.get('api/users/searchFriends').success(function(friends) {
      $scope.myFriends = friends;
      for (var i = 0; i < $scope.myFriends.length; i++) {
        $scope.statuses.push('friend');
      }
    }).error(function() {
      $scope.myFriends = [];
    });

    $scope.unfriend = function(index) {
      $http.post('api/users/removeFriend', $scope.myFriends[index]).success(function() {
        $scope.statuses.splice(index, 1);
        $scope.myFriends.splice(index, 1);
      }).error(function(response) {
        $scope.statuses[index] = 'error';
        $scope.err = response.message;
      });
    };
  }
]);
