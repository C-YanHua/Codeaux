'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$state',
                                   'Authentication', 'Modals',
  function($scope, $http, $state, Authentication, Modals) {
    // If user is signed in then redirect back home.
    if (Authentication.user) {
      $location.path('/');
    }

    $scope.signupModal = Modals.getModalById('signup');
    $scope.signinModal = Modals.getModalById('signin');

    $scope.authentication = Authentication;
    $scope.credentials = {
      username: '',
      email: '',
      password: ''
    };

    $scope.signupErrorMessage = null;
    $scope.signup = function() {
      $http.post('api/auth/signup', $scope.credentials).success(function(response) {
        // If successful we assign the response to the global user model.
        $scope.authentication.user = response;

        $scope.closeModal();
        // Redirect back to the index page.
        $state.go('home.main');

      }).error(function(response) {
        $scope.signupErrorMessage = response.errorMessage;

        if ('errors' in response.error) {
          for (var key in $scope.credentials) {
            if (key in response.error.errors) {
              $scope.setErrorMessage(key, response.error.errors[key].message, false);
            }
          }
        // Should only occur during development stage. (etherpad errors)
        } else if ('message' in response.error) {
          $scope.signupErrorMessage += ' ' + response.error.message;
        }
      });
    };

    $scope.signinErrorMessage = null;
    $scope.signin = function() {
      $http.post('api/auth/signin', $scope.credentials).success(function(response) {
        // If successful we assign the response to the global user model.
        $scope.authentication.user = response;

        $scope.closeModal();
        // Redirect back to the index page.
        $state.go('home.main');
      }).error(function(response) {
        $scope.signinErrorMessage = response.message;
      });
    };

    $scope.errorMessages = {
      username: {
        message: '',
        ngMessageName: 'usernameValidation',
        isValid: true
      },
      email: {
        message: '',
        ngMessageName: 'emailValidation',
        isValid: true
      },
      password: {
        message: '',
        ngMessageName: 'passwordValidation',
        isValid: true
      }
    };
    $scope.setErrorMessage = function(property, message, isValid) {
      var errorMessage = $scope.errorMessages[property];
      errorMessage.message = message;
      errorMessage.isValid = isValid;

      $scope.signupForm[property].$setValidity(errorMessage.ngMessageName, isValid);
    };
  }
]);
