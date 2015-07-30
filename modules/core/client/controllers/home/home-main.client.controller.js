/*
 * Main page controller.
 */
(function() {
  'use strict';

  function HomeMainController(Authentication) {
    var vm = this;
    vm.authentication = Authentication;
  }

  angular
    .module('core')
    .controller('HomeMainController', HomeMainController);

  HomeMainController.$inject = ['Authentication'];

})();
