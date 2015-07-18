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

          if (searchMatch(issue["name"], $scope.query)) {
            return true;
          } else if (searchMatch(issue["description"], $scope.query)) {
            return true;
          }

          return false;
        });
      };
    };

    var searchMatch = function(stuff, target) {
      if (!target) {
        return true;
      }
      return stuff.toString().toLowerCase().indexOf(target.toLowerCase()) !== -1;
    };

    $scope.$watch('currentPage + issuesPerPage + filteredIssues', function() {
      var begin = (($scope.currentPage - 1) * $scope.issuesPerPage);
      var end = begin + $scope.issuesPerPage;

      $scope.pagedIssues = $scope.filteredIssues.slice(begin, end);
    });
  }
]);
