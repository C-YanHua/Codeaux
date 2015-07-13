'use strict';

(function() {
  describe('NavigationBarController', function() {
    //Initialize global variables
    var scope;
    var NavigationBarController;

    // Load the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    beforeEach(inject(function($controller, $rootScope) {
      scope = $rootScope.$new();

      NavigationBarController = $controller('NavigationBarController', {
        $scope: scope
      });
    }));

    it('should expose the authentication service', function() {
      expect(scope.authentication).toBeTruthy();
    });
  });
})();
