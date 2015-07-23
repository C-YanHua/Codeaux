'use strict';

/*
 * Setting up core route.
 */
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {
    $stateProvider.

    // Home state routing.
    state('home', {
      url: '/',
      template: '<ui-view/>',
      controller: 'HomeController'
    }).
    state('home.landing', {
      templateUrl: '/modules/core/views/home/landing.client.view.html'
    }).
    state('home.main', {
      templateUrl: '/modules/core/views/home/main.client.view.html'
    }).

    // HTTP error routing.
    state('404-page-not-found', {
      templateUrl: '/modules/core/views/404.client.view.html'
    }).
    state('500-server-error', {
      templateUrl: '/modules/core/views/500.client.view.html'
    });

    // Redirect to 404 error page when route not found.
    $urlRouterProvider.otherwise(function($injector, $location) {
      $injector.get('$state').go('404-page-not-found');

      // Retain the route that user requested in the url.
      return $location.path();
    });
  }
]);
