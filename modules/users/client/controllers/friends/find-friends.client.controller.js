'use strict';

angular.module('users').controller('FindFriendsController', ['$scope', '$stateParams', '$http', '$location',
                                                          'Authentication', 'Users',
  function($scope, $stateParams, $http, $location, Authentication, Users) {
    $scope.authentication = Authentication;

    console.log("This is the find-friends controller speaking...");

    $scope.foundUsers = [];
    $scope.friendStatuses = [];
    var myFriends = Authentication.user.friends;

    $scope.search = function() {
      if ($scope.query) {
        $scope.foundUsers = Users.query({username: $scope.query}, function() {

          console.log($scope.foundUsers.length);

          for (var i=0; i<$scope.foundUsers.length; i++) {
            console.log("Yo "+i);
            for (var j=0; j<myFriends.length; j++) {
              console.log("Ha "+j);
              if ($scope.foundUsers[i] === myFriends[j]) {
                $scope.friendStatuses.push("friend");
                console.log($scope.friendStatuses);
              }
            }

            if ($scope.friendStatuses.length === i) {
              $scope.friendStatuses.push("stranger");
              console.log($scope.friendStatuses);
            }

          }


        });

      }
    };

  }
]);
