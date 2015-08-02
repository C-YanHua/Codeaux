'use strict';

angular.module('issues').controller('EditIssuesController', ['$scope', '$stateParams', '$location',
                                                       'Authentication', 'Issues', '$http', '$state',
  function($scope, $stateParams, $location, Authentication, Issues, $http, $state) {
    if (!Authentication.user) {
      $state.go('404-page-not-found');
    }

    $scope.authentication = Authentication;

    $scope.permissions = [];

    // Find existing Issue.
    $scope.findOne = function() {
      Issues.get({issueId: $stateParams.issueId}, function(foundIssue) {
        $scope.issue = foundIssue;

        $http.get('api/users/searchFriends').success(function(friends) {
          $scope.myFriends = friends;

          for (var i = 0; i < $scope.myFriends.length; i++) {
            for (var k = 0; k < $scope.issue.readWrite.length; k++) {
              if ($scope.myFriends[i]._id === $scope.issue.readWrite[k]) {
                $scope.permissions.push('ReadWrite');
                break;
              }
            }

            for (var j = 0; j < $scope.issue.readOnly.length; j++) {
              if ($scope.myFriends[i]._id === $scope.issue.readOnly[j]) {
                $scope.permissions.push('ReadOnly');
                break;
              }
            }

            if ($scope.permissions.length < (i + 1)) {
              $scope.permissions.push('None');
            }
          }
        }).error(function() {
          $scope.myFriends = [];
        });
      });
    };

    // Update existing Issue.
    $scope.update = function() {
      var issue = $scope.issue;

      issue.readWrite = [];
      issue.readOnly = [];

      for (var i = 0; i < $scope.permissions.length; i++) {
        if ($scope.permissions[i] === 'ReadWrite') {
          issue.readWrite.push($scope.myFriends[i]._id);
        } else if ($scope.permissions[i] === 'ReadOnly') {
          issue.readOnly.push($scope.myFriends[i]._id);
        }
      }

      issue.$update(function() {
        $location.path('issues/' + issue._id);
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
  }
]);
