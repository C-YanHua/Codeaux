'use strict';

angular.module('issues').controller('IssuesCreateCtrl', ['$scope', '$stateParams', '$location', 'Authentication', 'Issues',
  function($scope, $stateParams, $location, Authentication, Issues) {
    $scope.authentication = Authentication;

    // Create new Issue
    $scope.create = function() {
      // Create new Issue object
      var issue = new Issues ({
        name: this.name,
        language: this.language
      });

      // Redirect after save
      issue.$save(function(response) {
        $location.path('issues/' + response._id);

        // Clear form fields
        $scope.name = '';
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
  }
]);

angular.module('issues').controller('IssuesListCtrl', ['$scope', '$filter', '$stateParams', '$location', 'Authentication', 'Issues',
  function($scope, $filter, $stateParams, $location, Authentication, Issues) {
    $scope.authentication = Authentication;

    $scope.filteredIssues = [];

    // Find a list of Issues
    $scope.find = function() {
      $scope.issues = Issues.query(function() {
        $scope.currentPage = 1;
        $scope.pagedIssues = [];
        $scope.issuesPerPage = 5;
        $scope.numOfPageIcons = 5;

        $scope.filteredIssues = $scope.issues.slice(0, $scope.issues.length);
      });

      $scope.$watch('currentPage + issuesPerPage + filteredIssues', function() {
        var begin = (($scope.currentPage - 1) * $scope.issuesPerPage);
        var end = begin + $scope.issuesPerPage;

        $scope.pagedIssues = $scope.filteredIssues.slice(begin, end);
      });
    };

    var searchMatch = function(stuff, target) {
      if (!target) {
        return true;
      }
      return stuff.toString().toLowerCase().indexOf(target.toLowerCase())!==-1;
    };

    $scope.search = function() {
      $scope.filteredIssues = $filter('filter')($scope.issues, function(issue) {
        for (var property in issue) {
          if (searchMatch(issue[property], $scope.query)) {
            return true;
          }
        }
        return false;
      });
    };
  }
]);

angular.module('issues').controller('IssuesEditCtrl', ['$scope', '$stateParams', '$location', 'Authentication', 'Issues',
  function($scope, $stateParams, $location, Authentication, Issues) {
    $scope.authentication = Authentication;

    // Find existing Issue
    $scope.findOne = function() {
      $scope.issue = Issues.get({issueId: $stateParams.issueId});
    };

    // Update existing Issue
    $scope.update = function() {
      var issue = $scope.issue;

      issue.$update(function() {
        $location.path('issues/' + issue._id);
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
  }
]);

angular.module('issues').controller('IssuesViewCtrl', ['$scope', '$stateParams', '$location', 'Authentication', 'Issues', '$sce',
  function($scope, $stateParams, $location, Authentication, Issues, $sce) {
    $scope.authentication = Authentication;

    // Find existing Issue
    $scope.findOne = function() {
      $scope.issue = Issues.get({issueId: $stateParams.issueId}, function() {
        if ($scope.authentication.user) {
          $scope.etherpadSrc = $sce.trustAsResourceUrl("http://localhost:9001/p/"+$scope.issue.padId);
        } else {
          $scope.etherpadSrc = $sce.trustAsResourceUrl("http://localhost:9001/p/"+$scope.issue.readOnlyPadId);
        }
      });
    };

    // Remove existing Issue
    $scope.remove = function(issue) {
      if ( issue ) {
        issue.$remove();

        for (var i in $scope.issues) {
          if ($scope.issues [i] === issue) {
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
