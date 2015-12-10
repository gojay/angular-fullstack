'use strict';

var app = require('../..');
var request = require('supertest');

var newPerson;

describe('Person API:', function() {

  describe('GET /api/persons', function() {
    var persons;

    beforeEach(function(done) {
      request(app)
        .get('/api/persons')
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          persons = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      persons.should.be.instanceOf(Array);
    });

  });

  describe('POST /api/persons', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/persons')
        .send({
          name: 'New Person',
          info: 'This is the brand new person!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          newPerson = res.body;
          done();
        });
    });

    it('should respond with the newly created person', function() {
      newPerson.name.should.equal('New Person');
      newPerson.info.should.equal('This is the brand new person!!!');
    });

  });

  describe('GET /api/persons/:id', function() {
    var person;

    beforeEach(function(done) {
      request(app)
        .get('/api/persons/' + newPerson._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          person = res.body;
          done();
        });
    });

    afterEach(function() {
      person = {};
    });

    it('should respond with the requested person', function() {
      person.name.should.equal('New Person');
      person.info.should.equal('This is the brand new person!!!');
    });

  });

  describe('PUT /api/persons/:id', function() {
    var updatedPerson

    beforeEach(function(done) {
      request(app)
        .put('/api/persons/' + newPerson._id)
        .send({
          name: 'Updated Person',
          info: 'This is the updated person!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          updatedPerson = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedPerson = {};
    });

    it('should respond with the updated person', function() {
      updatedPerson.name.should.equal('Updated Person');
      updatedPerson.info.should.equal('This is the updated person!!!');
    });

  });

  describe('DELETE /api/persons/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete('/api/persons/' + newPerson._id)
        .expect(204)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when person does not exist', function(done) {
      request(app)
        .delete('/api/persons/' + newPerson._id)
        .expect(404)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          done();
        });
    });

  });

});
