'use strict';

/*
 * Configure HTTP Error Interceptor.
 */
angular.module('core').config(['$httpProvider',
  function($httpProvider) {
    // Set the httpProvider interceptor.
    $httpProvider.interceptors.push(['$q', '$injector', '$window', 'Authentication',
      function($q, $injector, $window, Authentication) {
        return {
          responseError: function(rejection) {
            switch (rejection.status) {
              case 401:
                // Deauthenticate the global user.
                Authentication.user = null;
                $window.user = null;

                // Transit to landing page.
                $injector.get('$state').go('home.landing');
                break;

              case 403:
                // Add unauthorized behaviour.
                break;

              case 404:
                // Transit to 404 not found page.
                $injector.get('$state').go('404-page-not-found');
                break;

              case 500:
                // Transit to 500 internal server error page.
                $injector.get('$state').go('500-server-error');
                break;
            }

            return $q.reject(rejection);
          }
        };
      }
    ]);
  }
]);

angular.module('core').run(['Menus',
  function(Menus) {
    // Add menu for application navigation bar (header).
    Menus.addMenu('navigationbar', {
      isPublic: false
    });
  }
]);
