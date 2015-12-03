'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var faker = require('faker');
var _ = require('lodash');
var Q = require('q');

var Auth = require('../../auth/auth.service');

var User = require('../user/user.model');
var Material = require('./material.model');

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

describe('Materials', function() {
  this.timeout(60000);

  var token = [];
  var prices = [15000, 20000, 30000];

  before(function (done) {
    User.find().select('role').exec().then(function (users) {
      var promise;
      if(_.isEmpty(users)) {
        promise = User.create(_users_).then(function() {
          return User.find().select('role').exec();
        });
      } else {
        promise = Q.Promise(function (resolve) { resolve(users) }) ;
      }
      
      Q.all([ promise, Material.remove().exec() ]).spread(function (users) {
        _.forEach(users, function (user) {
          token[user.role] = 'Bearer ' + Auth.signToken(user._id.toString());
        });
        done();
      });
    });
  });

  it('should doesn\'t materials', function (done) {
    Material.count({}, function (err, total) {
      total.should.equal(0);
      done();
    });
  });

  describe('Create', function() {
    var materials;

    before(function() { 
      materials = _.times(2, function() {
        return {
          name: faker.commerce.productName(),
          price: prices[Math.floor(Math.random()*prices.length)],
          description: faker.commerce.productMaterial()
        };
      });
    });

    it('should have 2 materials', function() {
      materials.should.be.an.instanceOf(Array).and.have.lengthOf(2);
    });

    it('should 403 when role "admin_p" create material', function (done) {
      request(app)
        .post('/api/materials')
        .set('Authorization', token['admin_p'])
        .send(materials[0])
        .expect(403)
        .end(done);
    });

    it('should 403 when role "admin_co" create material', function (done) {
      request(app)
        .post('/api/materials')
        .set('Authorization', token['admin_co'])
        .send(materials[0])
        .expect(403)
        .end(done);
    });

    it('should 200 when role "admin_m" create material', function (done) {
      request(app)
        .post('/api/materials')
        .set('Authorization', token['admin_m'])
        .send(materials[0])
        .expect(201)
        .end(done);
    });

    it('should 200 when role "root" create material', function (done) {
      request(app)
        .post('/api/materials')
        .set('Authorization', token['root'])
        .send(materials[1])
        .expect(201)
        .end(done);
    });

    it('should have 2 materials in DB', function (done) {
      request(app)
        .get('/api/materials')
        .set('Authorization', token['admin_m'])
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
    var material;

    before(function (done) {
      Material.findOne().select('name description price').exec()
        .then(function (_material_) {
          material = _material_;
          material.price = 20000;
          done();
        });
    });

    it('should have material, price is 20000', function() {
      material.should.be.instanceOf(Object);
      material.price.should.equal(20000);
    });

    it('should 403 when role "admin_p" edit material', function (done) {
      request(app)
        .put('/api/materials/'+ material._id.toString())
        .set('Authorization', token['admin_p'])
        .send(material)
        .expect(403)
        .end(done);
    });

    it('should 403 when role "admin_co" edit material', function (done) {
      request(app)
        .put('/api/materials/'+ material._id.toString())
        .set('Authorization', token['admin_co'])
        .send(material)
        .expect(403)
        .end(done);
    });

    it('should 200 when role "admin_m" edit material', function (done) {
      request(app)
        .put('/api/materials/'+ material._id.toString())
        .set('Authorization', token['admin_m'])
        .send(material)
        .expect(200)
        .end(done);
    });

    it('should 200 when role "root" edit material', function (done) {
      request(app)
        .put('/api/materials/'+ material._id.toString())
        .set('Authorization', token['root'])
        .send(material)
        .expect(200)
        .end(done);
    });
  });

  describe('Delete', function() {
    var materialIds;

    before(function (done) {
      Material.find().select('_id').exec()
        .then(function (materials) {
          materialIds = _.pluck(materials, '_id').map(function(id) { return id.toString() });
          console.log(materialIds);
          done();
        });
    });

    it("should have product id", function() {
      materialIds.should.be.an.instanceOf(Array);
    });

    it('should 403 when role "admin_p" delete the material', function (done) {
      request(app)
        .del('/api/materials/'+ materialIds[0])
        .set('Authorization', token['admin_p'])
        .expect(403)
        .end(done);
    });

    it('should 403 when role "admin_co" delete the material', function (done) {
      request(app)
        .del('/api/materials/'+ materialIds[0])
        .set('Authorization', token['admin_co'])
        .expect(403)
        .end(done);
    });

    it('should 204 when role "admin_m" delete the material', function (done) {
      request(app)
        .del('/api/materials/'+ materialIds[0])
        .set('Authorization', token['admin_m'])
        .expect(204)
        .end(done);
    });

    it('should 204 when role "root" delete the material', function (done) {
      request(app)
        .del('/api/materials/'+ materialIds[1])
        .set('Authorization', token['root'])
        .expect(204)
        .end(done);
    });
  });

});