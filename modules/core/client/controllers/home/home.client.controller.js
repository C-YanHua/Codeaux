/*
 * Home page controller.
 */
(function() {
  'use strict';

  function HomeController($state, Authentication) {
    var vm = this;
    vm.authentication = Authentication;

    if (vm.authentication.user) {
      $state.go('home.main');
    } else {
      $state.go('home.landing');
    }
  }

  angular
    .module('core')
    .controller('HomeController', HomeController);

  HomeController.$inject = ['$state', 'Authentication'];

})();
