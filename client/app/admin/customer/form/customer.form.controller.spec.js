'use strict';

describe('Controller: CustomerFormCtrl', function () {

  // load the controller's module
  beforeEach(module('materialApp'));

  var CustomerFormCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CustomerFormCtrl = $controller('CustomerFormCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
