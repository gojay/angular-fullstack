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

import _ from 'lodash';
import Q from 'q';
import Service from './service.model';
import Seed from '../../config/seed';

const PRICES = [10000, 15000, 20000, 25000, 30000, 35000, 40000, 45000, 50000];

describe.only('Service model', function() {
  this.timeout(600000);

  it('should seed services', (done) => {
    Seed.service().then(() => {
      console.log('seed done!');
      done();
    }).then(null, (err) => {
      console.log('seed ERROR!', err);
      done(err);
    });
  });

  it('should get all', (done) => {
    Service.getAll().then((result) => {
      console.log('ALL', JSON.stringify(result, null, 2));
      done();
    });
  });

  it.skip('should reference', (done) => {
    Q.all([
      Service.findOne({ name: /issues/i }).select('_id').exec(),
      Service.findById('566a85bfa4ed33e8022d6e9a').exec()
    ]).spread((reference, samsung) => {
      return samsung.getChildrenAsync().then((children) => {
        var promises = children.map((smartphone) => {
          return Service.update({ _id: smartphone._id }, { $set: { reference: reference._id } }).exec();
        });
        return Q.all(promises);
      });
    }).then(() => {
      done();
    });
  });

  it.skip('should get estimate price', (done) => {
    Service.findById('566a85bfa4ed33e8022d6e9a').exec()
      .then((samsung) => {
        return samsung.getChildrenAsync();
      })
      .then((children) => {
        var device = children[0]; // galaxy alpha
        return Service.getEstimatePrice({ 
          origin: device._id.toString() 
        });
      }).then((results) => {
        console.log('estimate:single', JSON.stringify(results, null, 2));
        done();
      });
  });

  it.skip('should get estimate price from service reference', (done) => {
    Q.all([
      Service.findOne({ name: /front/i }).select('_id').exec(),
      Service.findById('566a85bfa4ed33e8022d6e9a').exec()
    ])
    .spread((issue, samsung) => {
      this.issue = issue;
      return samsung.getChildrenAsync();
    })
    .then((children) => {
      var device = children[0]; // galaxy alpha
      return Service.getEstimatePrice({ 
        origin: this.issue._id.toString(), 
        reference: device._id.toString() 
      });
    }).then((results) => {
      console.log('estimate:reference', JSON.stringify(results, null, 2));
      done();
    });
  });

  it.skip('should get primary', (done) => {
    Service.getPrimary().then((result) => {
      console.log(JSON.stringify(result, null, 1));
      done();
    });
  });

  it.skip('should get cost for "repair apple"', (done) => {
    Service.getCosts('5667d526e868df0c1c9cf627').then((result) => {
      console.log(JSON.stringify(result, null, 1));
      done();
    });
  });

  it.skip('should add "xiaomi" on smartphone using "add" ', (done) => {
    Service.findOne({ name: { $regex: 'smartphone', $options: 'i' } }).exec()
      .then((smartphone) => {
        return Service.add(smartphone._id.toString(), { name: 'Xiaomi', price: PRICES[Math.floor(Math.random()*PRICES.length)] });
      })
      .then((result) => {
        result.getAncestors({ isRoot: false }, 'name price', (err, _result_) => {
          done();
        });
      })
  });

  // after((done) => {
  //   Service.remove({ name: { $regex: 'xiaomi', $options: 'i' } }, done);
  // });
});
