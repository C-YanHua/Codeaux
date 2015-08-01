/*
 * Main page controller.
 */
(function() {
  'use strict';

  angular
    .module('core')
    .controller('HomeMainController', HomeMainController);

  HomeMainController.$inject = ['$state', 'Authentication'];

  function HomeMainController($state, Authentication) {
    // Temporary code. Redirect to issue until we decided what to show on main page.
    $state.go('issues.list');

    var vm = this;
    vm.authentication = Authentication;
  }
})();
