'use strict';

angular.module('issues').controller('MyIssuesController', ['$scope', 'Issues', '$stateParams', 'Authentication',
  function($scope, Issues, $stateParams, Authentication) {
    $scope.authentication = Authentication;

    var publicIssues = [];
    var privateIssues = [];
    $scope.issuesToShow = 'Public Issues';
    $scope.currentIssues = [];

    $scope.find = function() {
      Issues.query({owner:$scope.authentication.user._id}, function(issues) {
        for (var i = 0; i < issues.length; i++) {
          var eachIssue = issues[i];
          if (eachIssue.isPrivate === 0) {
            publicIssues.push(eachIssue);
          } else if (eachIssue.isPrivate === 1) {
            privateIssues.push(eachIssue);
          }
        }
        $scope.currentIssues = publicIssues;
      });
    };

    $scope.showPublicIssues = function() {
      $scope.issuesToShow = 'Public Issues';
      $scope.currentIssues = publicIssues;
    };

    $scope.showPrivateIssues = function() {
      $scope.issuesToShow = 'Private Issues';
      $scope.currentIssues = privateIssues;
    };

  }
]);
