'use strict';

angular.module('users').directive('validateUsername', ['$http', '$q',
  function($http, $q) {
    return {
      require: 'ngModel',
      restrict: 'A',
      link: function(scope, element, attributes, ngModel) {
        var isUsernameDirty = false;

        ngModel.$asyncValidators.validateUsername = function(modelValue, viewValue) {
          var value = modelValue || viewValue;
          var usernameDeferrer = $q.defer();

          if (isUsernameDirty) {
            scope.credentials.username = value;

            return $http.post('api/auth/signup_validate/username', {username: value}).success(function() {
              scope.setErrorMessage('username', null, true);
            }).error(function(response) {
              scope.setErrorMessage('username', response.error.username, false);
            });

          } else {
            isUsernameDirty = true;

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
        var isEmailDirty = false;

        ngModel.$asyncValidators.validateEmail = function(modelValue, viewValue) {
          var value = modelValue || viewValue;
          var emailDeferrer = $q.defer();

          if (isEmailDirty) {
            scope.credentials.email = value;

            return $http.post('api/auth/signup_validate/email', {email: value}).success(function() {
              scope.setErrorMessage('email', null, true);
            }).error(function(response) {
              scope.setErrorMessage('email', response.error.email, false);
            });

          } else {
            isEmailDirty = true;

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
        var isPasswordDirty = false;

        ngModel.$asyncValidators.validatePassword = function(modelValue, viewValue) {
          var value = modelValue || viewValue;
          var passwordDeferrer = $q.defer();

          if (isPasswordDirty) {
            scope.credentials.password = value;

            return $http.post('api/auth/signup_validate/password', {password: value}).success(function() {
              scope.setErrorMessage('password', null, true);
            }).error(function(response) {
              scope.setErrorMessage('password', response.error.password, false);
            });

          } else {
            isPasswordDirty = true;

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
