'use strict';

angular.module('core').controller('NavigationBarController', ['$scope', '$state', 'Authentication', 'Menus', 'Modals',
  function($scope, $state, Authentication, Menus, Modals) {
    $scope.$state = $state;
    $scope.authentication = Authentication;

    // Navigation bar menus.
    $scope.navbarMenu = Menus.getMenuById('navigationBar');

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
]);
