'use strict';

angular.module('users').directive('validateUsername', ['$http', '$q',
  function($http, $q) {
    return {
      require: 'ngModel',
      restrict: 'A',
      link: function(scope, element, attributes, ngModel) {
        ngModel.$asyncValidators.validateUsername = function(modelValue, viewValue) {
          var value = modelValue || viewValue;
          var usernameDeferrer = $q.defer();

          if (value) {
            scope.credentials.username = value;

            return $http.post('api/auth/signup_validate/username', {username: value}).success(function() {
              scope.setErrorMessage('username', null, true);
            }).error(function(response) {
              scope.setErrorMessage('username', response.errorMessage, false);
            });

          } else {
            usernameDeferrer.resolve();
            return usernameDeferrer.promise;
          }
        };
      }
    };
  }
]);

angular.module('users').directive('validateEmail', ['$http', '$q',
  function($http, $q) {
    return {
      require: 'ngModel',
      restrict: 'A',
      link: function(scope, element, attributes, ngModel) {
        ngModel.$asyncValidators.validateEmail = function(modelValue, viewValue) {
          var value = modelValue || viewValue;
          var emailDeferrer = $q.defer();

          if (value) {
            scope.credentials.email = value;

            return $http.post('api/auth/signup_validate/email', {email: value}).success(function() {
              scope.setErrorMessage('email', null, true);
            }).error(function(response) {
              scope.setErrorMessage('email', response.errorMessage, false);
            });

          } else {
            emailDeferrer.resolve();
            return emailDeferrer.promise;
          }
        };

        ngModel.$validators.email = function() {
          return true;
        };
      }
    };
  }
]);

angular.module('users').directive('validatePassword', ['$http', '$q',
  function($http, $q) {
    return {
      require: 'ngModel',
      restrict: 'A',
      link: function(scope, element, attributes, ngModel) {
        ngModel.$asyncValidators.validatePassword = function(modelValue, viewValue) {
          var value = modelValue || viewValue;
          var passwordDeferrer = $q.defer();

          if (value) {
            scope.credentials.password = value;

            return $http.post('api/auth/signup_validate/password', {password: value}).success(function() {
              scope.setErrorMessage('password', null, true);
            }).error(function(response) {
              scope.setErrorMessage('password', response.errorMessage, false);
            });

          } else {
            passwordDeferrer.resolve();
            return passwordDeferrer.promise;
          }
        };

        ngModel.$validators.password = function() {
          return true;
        };
      }
    };
  }
]);
