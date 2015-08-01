/*
 * List issues page controller.
 */
'use strict';

angular.module('issues').controller('ListIssuesController', ['$scope', '$filter', '$stateParams', '$location',
                                                             'Authentication', 'Issues',
  function($scope, $filter, $stateParams, $location, Authentication, Issues) {
    $scope.authentication = Authentication;

    $scope.filteredIssues = [];

    // Find a list of Issues.
    $scope.find = function() {
      var issues = Issues.query(function() {
        $scope.currentPage = 1;
        $scope.pagedIssues = [];
        $scope.issuesPerPage = 5;
        $scope.numOfPageIcons = 5;

        $scope.filteredIssues = issues.slice(0, issues.length);
      });

      $scope.search = function() {
        $scope.filteredIssues = $filter('filter')(issues, function(issue) {

          var match = [issue.title, issue.description];

          if (matcher(match, $scope.query)) {
            return true;
          }

          return false;
        });
      };
    };

    var matcher = function(match, query) {
      if (!query || !Array.isArray(match)) {
        return true;
      }

      for (var i = 0; i < match.length; i++) {
        if (match[i].toString().toLowerCase().indexOf(query.toLowerCase()) !== -1) {
          return true;
        }
      }

      return false;
    };

    $scope.$watch('currentPage + issuesPerPage + filteredIssues', function() {
      var begin = (($scope.currentPage - 1) * $scope.issuesPerPage);
      var end = begin + $scope.issuesPerPage;

      $scope.pagedIssues = $scope.filteredIssues.slice(begin, end);
    });
  }
]);
