'use strict';

angular.module('users').controller('FriendRequestsController', ['$scope', '$stateParams', '$http', '$state',
                                                                'Authentication', 'Requests',
  function($scope, $stateParams, $http, $state, Authentication, Requests) {
    if (!Authentication.user) {
      $state.go('404-page-not-found');
    }

    $scope.authentication = Authentication;

    $scope.friendStatuses = [];
    $scope.sentStatuses = [];

    $scope.getRequests = function() {
      Requests.query({receiverID: $scope.authentication.user._id}, function(requestsReceived) {
        $scope.friendRequests = requestsReceived;
        for (var i = 0; i < $scope.friendRequests.length; i++) {
          $scope.friendStatuses.push('unchanged');
        }
      });

      Requests.query({requesterID: $scope.authentication.user._id}, function(requestsSent) {
        $scope.sentRequests = requestsSent;
        for (var j = 0; j < $scope.sentRequests.length; j++) {
          $scope.sentStatuses.push('sent');
        }
      });
    };

    $scope.acceptRequest = function(index) {
      var selectedRequest = $scope.friendRequests[index];
      selectedRequest.status = 'accepted';

      selectedRequest.$update(function() {
        $http.post('api/users/addFriend', selectedRequest).success(function() {
          $scope.friendStatuses[index] = 'accepted';
        }).error(function(response) {
          $scope.friendStatuses[index] = 'errorAccept';
          $scope.err = response.message;
        });

      }, function(errorResponse) {
        $scope.friendStatuses[index] = 'errorAccept';
        $scope.err = errorResponse;
      });
    };

    $scope.rejectRequest = function(index) {
      var selectedRequest = $scope.friendRequests[index];
      selectedRequest.status = 'rejected';

      selectedRequest.$update(function() {
        $scope.friendStatuses[index] = 'rejected';
      }, function(errorResponse) {
        $scope.friendStatuses[index] = 'errorReject';
        $scope.err = errorResponse;
      });
    };

    $scope.cancelRequest = function(index) {
      var selectedRequest = $scope.sentRequests[index];
      selectedRequest.status = 'cancelled';

      selectedRequest.$update(function() {
        $scope.sentStatuses.splice(index, 1);
        $scope.sentRequests.splice(index, 1);
      }, function(errorResponse) {
        $scope.sentStatuses[index] = 'errorCancel';
        $scope.err = errorResponse;
      });

    };

  }
]);
