/*
 * Navigation bar controller.
 */
(function() {
  'use strict';

  angular
    .module('core')
    .controller('NavigationBarController', NavigationBarController);

  NavigationBarController.$inject = ['$scope', '$state', 'Authentication', 'Menus', 'Modals'];

  function NavigationBarController($scope, $state, Authentication, Menus, Modals) {
    $scope.$state = $state;
    $scope.authentication = Authentication;

    // Navigationbar settings.
    $scope.navbarMenu = Menus.getMenuById('navigationbar');

    // Authentication modals.
    $scope.signupModal = Modals.getModalById('signup');
    $scope.signinModal = Modals.getModalById('signin');

    // Toggle menu items.
    $scope.isCollapsed = false;
    $scope.toggleCollapsibleMenu = function() {
      $scope.isCollapsed = !$scope.isCollapsed;
    };

    // Collapsing the menu after navigation.
    $scope.$on('$stateChangeSuccess', function() {
      $scope.isCollapsed = false;
    });
  }
})();
