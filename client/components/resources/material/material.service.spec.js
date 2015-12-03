'use strict';

describe('Service: material', function () {

  // load the service's module
  beforeEach(module('fullstackApp'));

  // instantiate service
  var material;
  beforeEach(inject(function (_material_) {
    material = _material_;
  }));

  it('should do something', function () {
    expect(!!material).toBe(true);
  });

});
