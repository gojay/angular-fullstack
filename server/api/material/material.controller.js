'use strict';

var _ = require('lodash');
var Q = require('q');
var Material = require('./material.model');
var utils = require('../../components/utils');

// Get list of materials
exports.index = function(req, res) {
  var page  = req.query.page || 1,
      limit = req.query.limit || 20,
      skip  = (page - 1) * limit;

  var query = utils.parseQuery(req.query);

  query.where.$or = [{
    active : { $exists: false },
  }, {
    active : {
      $exists: true,
      $eq: true
    }
  }];
  
  Q.all([
    Material.count(query.where).exec(),
    Material.find(query.where).sort(query.sort).skip(skip).limit(limit).exec()
  ])
  .spread(function (total, materials) {
    res.set('X-Pagination-Total-Count', total);
    res.json(200, materials);
  })
  .then(null, function (err) {
    handleError(res, err);
  });
};

// Get a single material
exports.show = function(req, res) {
  Material.findById(req.params.id, function (err, material) {
    if(err) { return handleError(res, err); }
    if(!material) { return res.send(404); }
    return res.json(material);
  });
};

// Creates a new material in the DB.
exports.create = function(req, res) {
  Material.create(req.body, function(err, material) {
    if(err) { return handleError(res, err); }
    return res.json(201, material);
  });
};

// Updates an existing material in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Material.findById(req.params.id, function (err, material) {
    if (err) { return handleError(res, err); }
    if(!material) { return res.send(404); }
    var updated = _.merge(material, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, material);
    });
  });
};

// Deletes a material from the DB.
exports.destroy = function(req, res) {
  Material.findById(req.params.id, function (err, material) {
    if(err) { return handleError(res, err); }
    if(!material) { return res.send(404); }
    material.active = false;
    material.save(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
    // material.remove(function(err) {
    //   if(err) { return handleError(res, err); }
    //   return res.send(204);
    // });
  });
};

exports.search = function(req, res) {
  var filter = req.body.q ? { name: new RegExp(req.body.q, 'i') } : {} ;

  filter.$or = [{
    active : { $exists: false },
  }, {
    active : {
      $exists: true,
      $eq: true
    }
  }];

  Material.find(filter).select('name price description').sort({ name: 1 }).exec()
    .then(function (materials) {
      res.json(materials);
    })
    .then(null, function(err) {
      handleError(res, err);
    });
};

function handleError(res, err) {
  console.log('handleError', err);
  return res.send(500, err);
}