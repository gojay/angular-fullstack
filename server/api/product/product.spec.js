'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var faker = require('faker');
var _ = require('lodash');
var Q = require('q');

var Auth = require('../../auth/auth.service');

var Product = require('./products.model');
var User = require('../user/user.model');
var Material = require('../material/material.model');

var _users_ = [{
  provider: 'local',
  role: 'admin_m',
  name: 'Admin Material',
  email: 'material@admin.com',
  password: 'admin'
}, {
  provider: 'local',
  role: 'admin_p',
  name: 'Admin Product',
  email: 'product@admin.com',
  password: 'admin'
}, {
  provider: 'local',
  role: 'admin_co',
  name: 'Admin Customer & Order',
  email: 'co@admin.com',
  password: 'admin'
}, {
  provider: 'local',
  role: 'root',
  name: 'Root',
  email: 'root@root.com',
  password: 'root'
}];

describe('Products', function() {
  this.timeout(60000);

  var token = [];
  var materials = [], data = {};

  var prices = [15000, 20000, 30000];

  before(function (done) {
    User.find().select('role').exec()
    .then(function (users) {
      var promise = _.isEmpty(users) ? 
        User.create(_users_).then(function() {
          return User.find().select('role').exec();
        }) :
        Q.Promise(function (resolve) { resolve(users) }) ;
      return Q.all([
        promise,
        Product.remove().exec(),
        Material.remove().exec()
      ])
      .spread(function (users) {

        _.forEach(users, function (user) {
          token[user.role] = 'Bearer ' + Auth.signToken(user._id.toString());
        });

        var materials = _.times(10, function() {
          return {
            name: faker.commerce.productName(),
            price: prices[Math.floor(Math.random()*prices.length)],
            description: faker.commerce.productMaterial()
          };
        });
        return Material.create(materials);
      });
    })
    .then(function() {
      return Material.find().lean().select('name').limit(2).exec();
    })
    .then(function (_materials_) {
      materials = _.map(_materials_, function (material) {
        return {
          _material: material,
          qty: _.random(1,5)
        };
      });
      data = {
        materials: materials,
        sku: 'SKU-1',
        name: faker.commerce.productName(),
        stock: _.random(5,10),
        description: faker.lorem.sentence()
      }
      done();
    });
  });

  it('should have 2 materials & data', function() {
    materials.should.have.lengthOf(2);
    data.should.be.an.instanceOf(Object).and.have.properties(['materials', 'sku', 'name', 'stock', 'description'])
  });

  describe('Created by admin', function() {
    it('should 403 when role "admin_m" create product', function (done) {
      request(app)
        .post('/api/products')
        .set('Authorization', token['admin_m'])
        .send(data)
        .expect(403)
        .end(done);
    });

    it('should 200 when role "admin_p" create product', function (done) {
      request(app)
        .post('/api/products')
        .set('Authorization', token['admin_p'])
        .send(data)
        .expect(201)
        .end(done);
    });

    it('should have 1 product in DB', function (done) {
      request(app)
        .get('/api/products')
        .set('Authorization', token['admin_p'])
        .expect(200)
        .end(function (err, res) {
          if(err) return done(err);
          should.exist(res.headers['x-pagination-total-count']);
          res.headers['x-pagination-total-count'].should.equal('1');
          res.body.should.be.instanceOf(Array).and.have.lengthOf(1);
          done();
        });
    });
  });

  describe('Created by root', function() {
    before(function (done) {
      Material.find().lean().select('name').skip(2).limit(3).exec()
        .then(function (_materials_) {
          materials = _.map(_materials_, function (material) {
            return {
              _material: material,
              qty: _.random(1,5)
            };
          });
          data = {
            materials: materials,
            sku: 'SKU-2',
            name: faker.commerce.productName(),
            stock: _.random(5,10),
            description: faker.lorem.sentence()
          }
          done();
        });
    });

    it('should 200 create product', function (done) {
      request(app)
        .post('/api/products')
        .set('Authorization', token['root'])
        .send(data)
        .expect(201)
        .end(done);
    });

    it('should have 2 products in DB', function (done) {
      request(app)
        .get('/api/products')
        .set('Authorization', token['root'])
        .expect(200)
        .end(function (err, res) {
          if(err) return done(err);
          should.exist(res.headers['x-pagination-total-count']);
          res.headers['x-pagination-total-count'].should.equal('2');
          res.body.should.be.instanceOf(Array).and.have.lengthOf(2);

          done();
        });
    });
  });

  describe('Edit', function() {
    var product;

    before(function (done) {
      Product.findOne().populate({ path: 'materials._material', select: 'name' }).select('name stock description materials').exec()
        .then(function (_product_) {
          product = _product_;
          done();
        });
    });

    it('should have product', function() {
      product.should.be.instanceOf(Object);
    });
 
    it('should edited product. stock to equal 10 & materials index 0 qty to equal 5 ', function (done) {
      var data = JSON.parse(JSON.stringify(product))
      data.stock = 10;
      data.materials[0].qty = 5;
      request(app)
        .put('/api/products/'+ product._id)
        .set('Authorization', token['admin_p'])
        .send(data)
        .expect(200)
        .end(function (err, res) {
          if(err) return done(err);
          Product.findById(product._id).exec()
            .then(function (updated) {
              updated.stock.should.equal(data.stock);
              updated.materials[0].qty.should.equal(data.materials[0].qty);
              done()
            });
        });
    });

    describe('change materials', function() {
      before(function (done) {
        Material.find().lean().select('name').skip(4).limit(1).exec()
          .then(function (_materials_) {
             materials = _.map(_materials_, function (material) {
              return {
                _material: material,
                qty: _.random(1,5)
              };
            });
            done();
          });
      });

      it('should have 1 material', function() {
        materials.should.be.instanceOf(Array).and.have.lengthOf(1);
      });
 
      it('should edited product. materials have length of 1', function (done) {
        var data = JSON.parse(JSON.stringify(product))
        data.materials = materials;
        request(app)
          .put('/api/products/'+ product._id)
          .set('Authorization', token['admin_p'])
          .send(data)
          .expect(200)
          .end(function (err, res) {
            if(err) return done(err);
            Product.findById(product._id).exec()
              .then(function (updated) {
                updated.materials.should.have.lengthOf(1);
                done()
              });
          });
      });
    });
  });

  describe('Delete', function() {
    var productIds;

    before(function (done) {
      Product.find().select('_id').exec()
        .then(function (products) {
          productIds = _.pluck(products, '_id').map(function(id) { return id.toString() });
          console.log(productIds);
          done();
        });
    });

    it("should have product id", function() {
      productIds.should.be.an.instanceOf(Array);
    });

    it('should 403 when role "admin_m" delete the material', function (done) {
      request(app)
        .del('/api/products/'+ productIds[0])
        .set('Authorization', token['admin_m'])
        .expect(403)
        .end(done);
    });

    it('should 403 when role "admin_co" delete the material', function (done) {
      request(app)
        .del('/api/products/'+ productIds[0])
        .set('Authorization', token['admin_co'])
        .expect(403)
        .end(done);
    });

    it('should 204 when role "admin_p" delete the material', function (done) {
      request(app)
        .del('/api/products/'+ productIds[0])
        .set('Authorization', token['admin_p'])
        .expect(204)
        .end(done);
    });

    it('should 204 when role "root" delete the material', function (done) {
      request(app)
        .del('/api/products/'+ productIds[1])
        .set('Authorization', token['root'])
        .expect(204)
        .end(done);
    });
  });

});