'use strict';

angular.module('users').controller('FindFriendsController', ['$scope', '$stateParams', '$http', '$location',
                                                          'Authentication', 'Users', 'Requests',
  function($scope, $stateParams, $http, $location, Authentication, Users, Requests) {
    $scope.authentication = Authentication;

    $scope.getInfo = function() {
      $scope.myFriends = $scope.authentication.user.friends;
      $scope.requestsSent = Requests.query({requesterID: $scope.authentication.user._id});
      $scope.requestsReceived = Requests.query({receiverID: $scope.authentication.user._id});
    };

    $scope.search = function() {
      $scope.foundUsers = [];
      $scope.statuses = [];

      if ($scope.query) {
        Users.query({username: $scope.query}, function(foundPeople) {

          for (var i=0; i<foundPeople.length; i++) {
            if (foundPeople[i].username !== $scope.authentication.user.username) {
              $scope.foundUsers.push(foundPeople[i]);
            }

            for (var j=0; j<$scope.requestsSent.length; j++) {
              if ($scope.requestsSent[j].receiver._id === foundPeople[i]._id) {
                $scope.statuses.push('awaitingReply');
                break;
              }
            }
            for (var k=0; k<$scope.requestsReceived.length; k++) {
              if ($scope.requestsReceived[k].requester._id === foundPeople[i]._id) {
                $scope.statuses.push('toReply');
                break;
              }
            }
            for (var l=0; l<$scope.myFriends.length; l++) {
              if ($scope.myFriends[l] === foundPeople[i]._id) {
                $scope.statuses.push('friend');
                break;
              }
            }

            if ($scope.statuses.length !== $scope.foundUsers.length) {
              $scope.statuses.push('stranger');
            }
          }
        });
      }
    };

    $scope.sendRequest = function(newFriend, index) {
      var friendRequest  = new Requests({
        requester: $scope.authentication.user,
        receiver: newFriend
      });

      friendRequest.$save(function(response) {
        $scope.statuses[index] = 'awaitingReply';
      }, function(errorRes) {
        $scope.statuses[index] = 'errorSent';
        $scope.err = errorRes;
      });
    };

    $scope.acceptRequest = function(index) {
      var selectedRequest = [];
      for (var k=0; k<$scope.requestsReceived.length; k++) {
        if ($scope.requestsReceived[k].requester._id === $scope.foundUsers[index]._id) {
          selectedRequest = $scope.requestsReceived[k];
          break;
        }
      }

      if (selectedRequest === []) {
        $scope.statuses[index] = 'errorAccept';
        $scope.err = 'Friend Request not found';
      } else {
        selectedRequest.status = 'accepted';
        selectedRequest.$update(function() {
          $http.post('api/users/friends', selectedRequest).success(function() {
            $scope.statuses[index] = 'friend';
          }).error(function(response) {
            $scope.friendStatuses[index] = 'errorAccept';
            $scope.err = response.message;
          });
        }, function(errorResponse) {
          $scope.friendStatuses[index] = 'errorAccept';
          $scope.err = errorResponse;
        });
      }
    };

    $scope.rejectRequest = function(index) {
      var selectedRequest = [];
      for (var k=0; k<$scope.requestsReceived.length; k++) {
        if ($scope.requestsReceived[k].requester._id === $scope.foundUsers[index]._id) {
          selectedRequest = $scope.requestsReceived[k];
          break;
        }
      }

      if (selectedRequest === []) {
        $scope.statuses[index] = 'errorReject';
        $scope.err = 'Friend Request not found';
      } else {
        selectedRequest.status = 'rejected';

        selectedRequest.$update(function() {
          $scope.statuses[index] = 'stranger';
        }, function(errorResponse) {
          $scope.friendStatuses[index] = 'errorReject';
          $scope.err = errorResponse;
        });
      }
    };

  }
]);
