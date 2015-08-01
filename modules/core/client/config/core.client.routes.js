/*
 * Setting up core route.
 */
(function() {
  'use strict';

  angular
    .module('core')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider', '$urlRouterProvider'];

  function routeConfig($stateProvider, $urlRouterProvider) {
    $stateProvider
      // Home state routing.
      .state('home', {
        url: '/',
        template: '<ui-view/>',
        controller: 'HomeController',
        controllerAs: 'vm'
      })
      .state('home.landing', {
        templateUrl: '/modules/core/views/home/landing.client.view.html',
        controller: 'HomeLandingController',
        controllerAs: 'vm'
      })
      .state('home.main', {
        templateUrl: '/modules/core/views/home/main.client.view.html',
        controller: 'HomeMainController',
        controllerAs: 'vm'
      })

      // HTTP error routing.
      .state('403-forbidden', {
        templateUrl: '/modules/core/views/403.client.view.html'
      })
      .state('404-page-not-found', {
        templateUrl: '/modules/core/views/404.client.view.html'
      })
      .state('500-server-error', {
        templateUrl: '/modules/core/views/500.client.view.html'
      });

    // Redirect to 404 error page when route not found.
    $urlRouterProvider.otherwise(function($injector, $location) {
      $injector.get('$state').go('404-page-not-found');

      // Retain the route that user requested in the url.
      return $location.path();
    });
  }
})();
