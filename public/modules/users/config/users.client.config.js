'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
  function($httpProvider) {
    // Set the httpProvider "not authorized" interceptor
    $httpProvider.interceptors.push(['$q', '$location', 'Authentication',
      function($q, $location, Authentication) {
        return {
          responseError: function(rejection) {
            switch (rejection.status) {
              case 401:
                // Deauthenticate the global user
                Authentication.user = null;

                // Redirect to home page
                $location.path('/');
                break;
              case 403:
                // Add unauthorized behaviour
                break;
            }

            return $q.reject(rejection);
          }
        };
      }
    ]);
  }
]);

angular.module('users').run(['Modals',
  function(Modals) {
    var AUTH_VIEW_DIRECTORY = '/modules/users/views/authentication/';

    Modals.addModal('signup', AUTH_VIEW_DIRECTORY + 'signup.client.view.html', 'sm');
    Modals.addModal('signin', AUTH_VIEW_DIRECTORY + 'signin.client.view.html', 'sm');
  }
]);

