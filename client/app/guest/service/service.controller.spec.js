'use strict';

describe('Controller: ServiceCtrl', function () {

  // load the controller's module
  beforeEach(module('fullstackApp'));

  var ServiceCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ServiceCtrl = $controller('ServiceCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
