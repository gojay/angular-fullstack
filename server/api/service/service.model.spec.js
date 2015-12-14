'use strict';

import _ from 'lodash';
import Q from 'q';
import Service from './service.model';
import Seed from '../../config/seed';

const PRICES = [10000, 15000, 20000, 25000, 30000, 35000, 40000, 45000, 50000];

describe.only('Service Model :', function() {
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
      // console.log('ALL', JSON.stringify(result, null, 2));
      result.should.be.an.instanceOf(Array);
    }).finally(done);
  });

  describe('primary', () => {

    it('should get default', (done) => {
      Service.getPrimary().then((result) => {
        _.pluck(result, 'name').should.eql(['Repairs', 'Setup & Installations'])
        done();
      });
    });

    it('should get mobile issues', (done) => {
      Service.getPrimary('Mobile issues').then((result) => {
        _.pluck(result, 'name').should.eql(['Hardware', 'Software'])
        done();
      });
    });

    it('should get desktop issues', (done) => {
      Service.getPrimary('Desktop issues').then((result) => {
        _.pluck(result, 'name').should.eql(['Hardware', 'Software'])
        done();
      });
    });
  });

  describe('children', () => {
    var item;

    before((done) => {
      Service.findOne({ name: 'Galaxy Alpha' }).select('_id reference').execAsync()
        .then((_item_) => {
          item = _item_;
        })
        .finally(done);
    });

    it('should has reference', () => {
      item.reference.should.be.ok
    });

    it('should get services children', (done) => {
      Service.getChildren().then((children) => {
        // console.log('services children', JSON.stringify(children, null, 1));
        children.should.be.an.instanceOf(Array);
      }).finally(done);
    });

    it('should get reference children', (done) => {
      Service.getChildren(item.reference).then((children) => {
        // console.log('references children', JSON.stringify(children, null, 1));
        children.should.be.an.instanceOf(Array);
      }).finally(done);
    });
  })

  describe('Galaxy Alpha', () => {
    var item, issue;

    before((done) => {
      Q.all([
        Service.findOne({ name: 'Front glass replacement' }).select('_id').execAsync(),
        Service.findOne({ name: 'Galaxy Alpha' }).select('_id').execAsync()
      ]).spread((_issue_, _item_) => {
        issue = _issue_;
        item = _item_;
      })
      .finally(done);
    });

    it('should have an item & issue', () => {
      item.should.be.instanceOf(Object);
      issue.should.be.instanceOf(Object);
    });

    describe('estimate', () => {

      it('should get price', (done) => {
        Service.getEstimatePrice({ 
          origin: item._id.toString() 
        })
        .then((results) => {
          // console.log('estimate:single', JSON.stringify(results, null, 2));
          results.should.have.properties(['items', 'estimate_price', 'id', 'step']);
          results.step.should.eql(['Repairs', 'Smartphone', 'Samsung', 'Galaxy Alpha']);
        })
        .finally(done);
      });

      it('should get price by reference', (done) => {
        Service.getEstimatePrice({ 
          origin: item._id.toString(),
          reference: issue._id.toString() 
        })
        .then((results) => {
          // console.log('estimate:reference', JSON.stringify(results, null, 2));
          results.should.have.properties(['items', 'estimate_price', 'id', 'reference', 'step']);
          results.step.should.eql(['Repairs', 'Smartphone', 'Samsung', 'Galaxy Alpha', 'Hardware', 'Front glass replacement']);
        })
        .finally(done);
      });

    });
  });

  describe('Add Acer', () => {

    it('should added "Acer" on smartphone', (done) => {
      Service.findOne({ name: { $regex: 'smartphone', $options: 'i' } }).execAsync()
        .then((smartphone) => {
          return Service.add({ parent: smartphone._id.toString(), name: 'Acer', price: PRICES[Math.floor(Math.random()*PRICES.length)] });
        })
        .then((result) => {
          return result.getAncestorsAsync({ isRoot: false }, 'name price');
        })
        .then((result) => {
          // console.log('Acer', JSON.stringify(result, null, 2));
          var parents = _.pluck(result, 'name');
          parents.should.eql(['Repairs', 'Smartphone']);
        })
        .finally(done);
    });

    after((done) => {
      Service.remove({ name: { $regex: 'Acer', $options: 'i' } }).execAsync().finally(done);
    });
  });
});