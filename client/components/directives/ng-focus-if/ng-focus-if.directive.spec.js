'use strict';

describe('Directive: ngFocusIf', function () {

  // load the directive's module
  beforeEach(module('fullstackApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<ng-focus-if></ng-focus-if>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the ngFocusIf directive');
  }));
});
