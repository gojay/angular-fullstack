'use strict';

describe('Controller: MaterialCtrl', function () {

  // load the controller's module
  beforeEach(module('fullstackApp'));

  var MaterialCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MaterialCtrl = $controller('MaterialCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
