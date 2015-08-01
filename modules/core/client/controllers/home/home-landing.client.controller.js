/*
 * Landing page controller.
 */
(function() {
  'use strict';

  angular
    .module('core')
    .controller('HomeLandingController', HomeLandingController);

  HomeLandingController.$inject = ['Authentication'];
  function HomeLandingController(Authentication) {
    var vm = this;
    vm.authentication = Authentication;
  }
})();
