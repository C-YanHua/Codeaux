'use strict';

angular.module('issues').controller('EditIssuesController', ['$scope', '$stateParams', '$state',
                                                       'Authentication', 'Issues',
  function($scope, $stateParams, $state, Authentication, Issues) {
    $scope.authentication = Authentication;

    // Find existing Issue.
    $scope.findOne = function() {
      $scope.issue = Issues.get({issueId: $stateParams.issueId});
    };

    // Update existing Issue.
    $scope.update = function() {
      var issue = $scope.issue;

      issue.$update(function() {
        $state.go('issues.list');
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
  }
]);
