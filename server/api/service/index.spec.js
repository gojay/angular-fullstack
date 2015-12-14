'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var serviceCtrlStub = {
  index: 'serviceCtrl.index',
  show: 'serviceCtrl.show',
  create: 'serviceCtrl.create',
  update: 'serviceCtrl.update',
  destroy: 'serviceCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var serviceIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './service.controller': serviceCtrlStub
});

describe.skip('Service API Router:', function() {

  it('should return an express router instance', function() {
    serviceIndex.should.equal(routerStub);
  });

  describe('GET /api/services', function() {

    it('should route to service.controller.index', function() {
      routerStub.get
        .withArgs('/', 'serviceCtrl.index')
        .should.have.been.calledOnce;
    });

  });

  describe('GET /api/services/:id', function() {

    it('should route to service.controller.show', function() {
      routerStub.get
        .withArgs('/:id', 'serviceCtrl.show')
        .should.have.been.calledOnce;
    });

  });

  describe('POST /api/services', function() {

    it('should route to service.controller.create', function() {
      routerStub.post
        .withArgs('/', 'serviceCtrl.create')
        .should.have.been.calledOnce;
    });

  });

  describe('PUT /api/services/:id', function() {

    it('should route to service.controller.update', function() {
      routerStub.put
        .withArgs('/:id', 'serviceCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('PATCH /api/services/:id', function() {

    it('should route to service.controller.update', function() {
      routerStub.patch
        .withArgs('/:id', 'serviceCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('DELETE /api/services/:id', function() {

    it('should route to service.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'serviceCtrl.destroy')
        .should.have.been.calledOnce;
    });

  });
});
