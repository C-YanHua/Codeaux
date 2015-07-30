/*
 * Landing page controller.
 */
(function() {
  'use strict';

  function HomeLandingController(Authentication) {
    var vm = this;
    vm.authentication = Authentication;
  }

  angular
    .module('core')
    .controller('HomeLandingController', HomeLandingController);

  HomeLandingController.$inject = ['Authentication'];

})();
