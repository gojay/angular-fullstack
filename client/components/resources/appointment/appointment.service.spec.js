'use strict';

describe('Service: appointment', function () {

  // load the service's module
  beforeEach(module('fullstackApp'));

  // instantiate service
  var appointment;
  beforeEach(inject(function (_appointment_) {
    appointment = _appointment_;
  }));

  it('should do something', function () {
    expect(!!appointment).toBe(true);
  });

});
