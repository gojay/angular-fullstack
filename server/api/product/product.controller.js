'use strict';

var mongoose = require('mongoose'),
    ObjectId = mongoose.Types.ObjectId;
var _ = require('lodash');
var Q = require('q');
var Products = require('./product.model');
var utils = require('../../components/utils');

// Get list of productss
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
    Products.count(query.where).exec(),
    Products.find(query.where).lean().populate([{ path: 'materials._material', select: 'name price active' }]).sort(query.sort).skip(skip).limit(limit).exec()
  ])
  .spread(function (total, products) {
    res.set('X-Pagination-Total-Count', total);
    products = products.map(function (product) {
      product.price = _.sum(product.materials, function (m) {
        return m.qty * m._material.price;
      });
      return product;
    });
    res.json(200, products);
  })
  .then(null, function (err) {
    handleError(res, err);
  });
};

// Get a single products
exports.show = function(req, res) {
  Products.findById(req.params.id).lean().populate({ path: 'materials._material', select: 'name price' }).exec()
  .then(function (product) {
    if(!product) { return res.send(404); }
    product.price = _.sum(product.materials, function (m) {
      return m.qty * m._material.price;
    });
    return res.json(product);
  })
  .then(null, function (err) {
    handleError(res, err);
  });
};

exports.detail = function(req, res) {
  Products.findById(req.params.id).populate('materials._material').exec()
  .then(function (product) {
    if(!product) { return res.send(404); }
    product.price = _.sum(product.materials, function (m) {
      return m.qty * m._material.price;
    });
    return res.json(product);
  })
  .then(null, function (err) {
    handleError(res, err);
  });
};

// Creates a new products in the DB.
exports.create = function(req, res) {
  var body = req.body;
  
  if(_.isArray(body.materials)) {
    var materials = _.map(body.materials, function (m) {
      return {
        _material: ObjectId(m._material._id),
        qty: m.qty
      };
    });
    body.materials = materials;
  }

  Products.create(body, function(err, products) {
    if(err) { return handleError(res, err); }
    return res.json(201, products);
  });
};

// Updates an existing products in the DB.
exports.update = function(req, res) {
  var body = req.body;
  if(body._id) { delete body._id; }

  if(_.isArray(body.materials)) {
    var materials = _.map(body.materials, function (m) {
      return {
        _material: ObjectId(m._material._id),
        qty: m.qty
      };
    });
    body.materials = materials;
  }

  Products.findById(req.params.id, function (err, product) {
    if (err) { return handleError(res, err); }
    if(!product) { return res.send(404); }
    var updated = _.extend(product, body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, product);
    });
  });
};

// Deletes a products from the DB.
exports.destroy = function(req, res) {
  Products.findById(req.params.id, function (err, product) {
    if(err) { return handleError(res, err); }
    if(!product) { return res.send(404); }
    product.active = false;
    product.save(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
    // product.remove(function(err) {
    //   if(err) { return handleError(res, err); }
    //   return res.send(204);
    // });
  });
};

exports.validator = function(req, res) {
  var query = req.query;
  var field = query.field || 'sku';
  var filter = {};
  if(query.q) {
    filter[field] = query.q
  }

  Products.findOne(filter).exec()
    .then(function (data) {
      var respond = data ? 422 : 200 ;
      res.send(respond);
    }).then(null, function (err) {
      handleError(res, err);
    });
};

exports.search = function(req, res) {
  var filter = { stock: { $gt: 0 } } ;
  if(req.body.q) filter.name = new RegExp(req.body.q, 'i');

  filter.$or = [{
    active : { $exists: false },
  }, {
    active : {
      $exists: true,
      $eq: true
    }
  }];

  Products.find(filter).populate('materials').sort({ name: 1 }).exec()
    .then(function (products) {
      products = products.map(function (product) {
        product.price = _.sum(product.materials, function (m) {
          return m.qty * m._material.price;
        });
        return product;
      });
      res.json(products);
    })
    .then(null, function(err) {
      handleError(res, err);
    });
};


function handleError(res, err) {
  console.log('handleError', err);
  return res.send(500, err);
}