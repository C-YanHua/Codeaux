'use strict';

angular.module('issues').controller('MyIssuesController', ['$scope', 'Issues', '$stateParams', 'Authentication',
  function($scope, Issues, $stateParams, Authentication) {
    $scope.authentication = Authentication;

    var publicIssues = [];
    var privateIssues = [];
    $scope.issuesToShow = 'Public Issues';

    $scope.currentPage = 1;
    $scope.currentIssues = [];
    $scope.pagedIssues = [];
    $scope.issuesPerPage = 5;
    $scope.numOfPageIcons = 5;

    $scope.find = function() {
      Issues.query({owner:$scope.authentication.user._id}, function(issues) {
        for (var i = 0; i < issues.length; i++) {
          var eachIssue = issues[i];
          if (eachIssue.isPrivateIssue === 0) {
            publicIssues.push(eachIssue);
          } else if (eachIssue.isPrivateIssue === 1) {
            privateIssues.push(eachIssue);
          }
        }
        $scope.currentIssues = publicIssues;
      });
    };

    var rePaginate = function() {
      var begin = (($scope.currentPage - 1) * $scope.issuesPerPage);
      var end = begin + $scope.issuesPerPage;

      $scope.pagedIssues = $scope.currentIssues.slice(begin, end);
    };

    $scope.showPublicIssues = function() {
      $scope.issuesToShow = 'Public Issues';
      $scope.currentIssues = publicIssues;

      if (publicIssues.length === privateIssues.length) {
        rePaginate();
      }
    };

    $scope.showPrivateIssues = function() {
      $scope.issuesToShow = 'Private Issues';
      $scope.currentIssues = privateIssues;

      if (publicIssues.length === privateIssues.length) {
        rePaginate();
      }
    };

    $scope.$watch('currentPage + issuesPerPage + currentIssues', function() {
      rePaginate();
    });

  }
]);
