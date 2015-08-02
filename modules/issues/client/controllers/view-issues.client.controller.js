'use strict';

angular.module('issues').controller('ViewIssuesController', ['$scope', '$stateParams', '$location',
                                                             'Authentication', 'Issues', '$sce', '$state',
  function($scope, $stateParams, $location, Authentication, Issues, $sce, $state) {
    $scope.authentication = Authentication;

    // Find existing Issue.
    $scope.findOne = function() {
      Issues.get({issueId: $stateParams.issueId}, function(issue) {
        $scope.issue = issue;

        if ($scope.authentication.user) {
          if ($scope.issue.owner._id === $scope.authentication.user._id) {
            $scope.etherpadSrc = $sce.trustAsResourceUrl($scope.issue.padId);
          } else if ($scope.issue.isPrivate === 1) {
            for (var i = 0; i < $scope.issue.readWrite.length; i++) {
              if ($scope.issue.readWrite[i] === $scope.authentication.user._id) {
                $scope.etherpadSrc = $sce.trustAsResourceUrl($scope.issue.padId);
                return;
              }
            }

            for (var j = 0; j < $scope.issue.readOnly.length; j++) {
              if ($scope.issue.readOnly[j] === $scope.authentication.user._id) {
                $scope.etherpadSrc = $sce.trustAsResourceUrl($scope.issue.readOnlyPadId);
                return;
              }
            }

            $state.go('404-page-not-found');
          } else {
            $scope.etherpadSrc = $sce.trustAsResourceUrl($scope.issue.padId);
          }
        } else {
          $scope.etherpadSrc = $sce.trustAsResourceUrl($scope.issue.readOnlyPadId);
        }
      });
    };

    // Remove existing Issue.
    $scope.remove = function(issue) {
      if (issue) {
        issue.$remove();

        for (var i in $scope.issues) {
          if ($scope.issues[i] === issue) {
            $scope.issues.splice(i, 1);
          }
        }
      } else {
        $scope.issue.$remove(function() {
          $location.path('issues');
        });
      }
    };
  }
]);
