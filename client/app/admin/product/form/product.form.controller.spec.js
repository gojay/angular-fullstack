'use strict';

describe('Controller: MaterialFormCtrl', function () {

  // load the controller's module
  beforeEach(module('fullstackApp'));

  var MaterialFormCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MaterialFormCtrl = $controller('MaterialFormCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
