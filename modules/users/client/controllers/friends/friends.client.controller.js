'use strict';

angular.module('users').controller('FriendsController', ['$scope', '$stateParams', '$http', '$state',
                                                                'Authentication', 'UserProfile', 'Requests',
  function($scope, $stateParams, $http, $state, Authentication, UserProfile, Requests) {
    if (Authentication.user) {
      $scope.userFriends = Authentication.user.friends;
      $scope.requestsSent = Requests.query({requesterID: Authentication.user._id});
      $scope.requestsReceived = Requests.query({receiverID: Authentication.user._id});
    }

    $scope.findUserProfile = function() {
      $scope.profile = UserProfile.get({username: $stateParams.username}, function() {
        $scope.statuses = [];
        $http.get('api/users/searchFriends', {params: $scope.profile}).success(function(friends) {
          //$scope.theFriends = friends;
          if (Authentication.user) {
            if ($scope.profile._id !== Authentication.user._id) {
              $scope.theFriends = [];
              for (var i = 0; i < friends.length; i++) {
                if (friends[i].username === Authentication.user.username) {
                  $scope.theFriends.push(friends[i]);
                  $scope.statuses.push('');
                }

                for (var j = 0; j < $scope.requestsSent.length; j++) {
                  if ($scope.requestsSent[j].receiver._id === friends[i]._id) {
                    $scope.statuses.push('awaitingReply');
                    break;
                  }
                }
                for (var k = 0; k < $scope.requestsReceived.length; k++) {
                  if ($scope.requestsReceived[k].requester._id === friends[i]._id) {
                    $scope.statuses.push('toReply');
                    break;
                  }
                }
                for (var l = 0; l < friends.length; l++) {
                  if ($scope.theFriends[l] === friends[i]._id) {
                    $scope.statuses.push('friend');
                    break;
                  }
                }

                if ($scope.statuses.length !== $scope.theFriends.length) {
                  $scope.statuses.push('stranger');
                }
              }
            } else {
              for (var m = 0; m < friends.length; m++) {
                $scope.statuses.push('friend');
              }
              $scope.theFriends = friends;
            }
          } else {
            $scope.theFriends = friends;
          }
        }).error(function() {
          $scope.theFriends = [];
        });

        $scope.unfriend = function(index) {
          $http.post('api/users/removeFriend', $scope.theFriends[index]).success(function() {
            $scope.statuses.splice(index, 1);
            $scope.theFriends.splice(index, 1);
          }).error(function(response) {
            $scope.statuses[index] = 'error';
            $scope.err = response.message;
          });
        };

        $scope.acceptRequest = function(index) {
          var selectedRequest = [];
          for (var k = 0; k < $scope.requestsReceived.length; k++) {
            if ($scope.requestsReceived[k].requester._id === $scope.theFriends[index]._id) {
              selectedRequest = $scope.requestsReceived[k];
              break;
            }
          }

          if (selectedRequest === [] || (!selectedRequest)) {
            $scope.statuses[index] = 'error';
            $scope.err = 'Friend Request not found';
          } else {
            selectedRequest.status = 'accepted';
            selectedRequest.$update(function() {
              $http.post('api/users/addFriend', selectedRequest).success(function() {
                $scope.statuses[index] = 'friend';
              }).error(function(response) {
                $scope.statuses[index] = 'error';
                $scope.err = response.message;
              });
            }, function(errorResponse) {
              $scope.statuses[index] = 'error';
              $scope.err = errorResponse;
            });
          }
        };

        $scope.rejectRequest = function(index) {
          var selectedRequest = [];
          for (var k = 0; k < $scope.requestsReceived.length; k++) {
            if ($scope.requestsReceived[k].requester._id === $scope.theFriends[index]._id) {
              selectedRequest = $scope.requestsReceived[k];
              break;
            }
          }

          if (selectedRequest === [] || (!selectedRequest)) {
            $scope.statuses[index] = 'error';
            $scope.err = 'Friend Request not found';
          } else {
            selectedRequest.status = 'rejected';

            selectedRequest.$update(function() {
              $scope.statuses[index] = 'stranger';
            }, function(errorResponse) {
              $scope.statuses[index] = 'error';
              $scope.err = errorResponse;
            });
          }
        };

        $scope.cancelRequest = function(index) {
          var selectedRequest = [];
          for (var k = 0; k < $scope.requestsSent.length; k++) {
            if ($scope.requestsSent[k].receiver._id === $scope.theFriends[index]._id) {
              selectedRequest = $scope.requestsSent[k];
              break;
            }
          }

          if (selectedRequest === [] || (!selectedRequest)) {
            $scope.statuses[index] = 'error';
            $scope.err = 'Friend Request not found';
          } else {
            selectedRequest.status = 'cancelled';

            selectedRequest.$update(function() {
              $scope.statuses[index] = 'stranger';
            }, function(errorResponse) {
              $scope.statuses[index] = 'error';
              $scope.err = errorResponse;
            });
          }
        };
      });
    };
  }
]);
