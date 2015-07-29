'use strict';

angular.module('users').controller('FindFriendsController', ['$scope', '$stateParams', '$http', '$location',
                                                          'Authentication', 'Users', 'Requests',
  function($scope, $stateParams, $http, $location, Authentication, Users, Requests) {
    $scope.authentication = Authentication;

    $scope.foundUsers = [];
    $scope.friendStatuses = [];
    var myFriends = Authentication.user.friends;

    $scope.search = function() {
      if ($scope.query) {
        $scope.foundUsers = Users.query({username: $scope.query}, function() {

          console.log($scope.foundUsers.length);

          for (var i = 0; i < $scope.foundUsers.length; i++) {
            console.log('foundUsers part ' + i);
            for (var j = 0; j < myFriends.length; j++) {
              console.log('myfriends part ' + j);
              if ($scope.foundUsers[i] === myFriends[j]) {
                $scope.friendStatuses.push('friend');
                console.log($scope.friendStatuses);
              }
            }

            if ($scope.friendStatuses.length === i) {
              $scope.friendStatuses.push('stranger');
              console.log($scope.friendStatuses);
            }
          }
        });
      }
    };

    $scope.addFriend = function(newFriend) {

      var friendRequest  = new Requests({
        requester: $scope.authentication.user,
        receiver: newFriend
      });

      friendRequest.$save(function(response) {
        // Update the current view to display friend request sent
      }, function(errorRes) {
        // Create a pop up to show the error message
      });
    };

  }
]);
