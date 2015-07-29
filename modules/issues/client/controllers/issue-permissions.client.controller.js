'use strict';

angular.module('issues').controller('IssuePermissionsController', ['$scope', '$stateParams', '$location',
                                                             'Authentication', 'Issues', '$state',
  function($scope, $stateParams, $location, Authentication, Issues, $state) {
    $scope.authentication = Authentication;
    $scope.issue = [];

    // Find existing Issue.
    $scope.findOne = function() {
      Issues.get({issueId: $stateParams.issueId}, function(issue) {
        $scope.issue = issue;
        if (issue.isPrivateIssue === 0) {
          $state.go('not-found');
        }
      });
    };
  }
]);
