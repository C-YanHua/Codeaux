'use strict';

angular.module('issues').controller('ViewIssuesController', ['$scope', '$stateParams', '$location',
                                                             'Authentication', 'Issues', '$sce',
  function($scope, $stateParams, $location, Authentication, Issues, $sce) {
    $scope.authentication = Authentication;

    // Find existing Issue.
    $scope.findOne = function() {
      $scope.issue = Issues.get({issueId: $stateParams.issueId}, function() {
        if ($scope.authentication.user) {
          $scope.etherpadSrc = $sce.trustAsResourceUrl($scope.issue.padId);
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
