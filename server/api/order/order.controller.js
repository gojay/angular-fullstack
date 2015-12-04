'use strict';

var mongoose = require('mongoose'),
    ObjectId = mongoose.ObjectId;
var _ = require('lodash');
var Q = require('q');
var Order = require('./order.model');
var OrderItem = require('./orderitem.model');
var User = require('../user/user.model');
var Customer = require('../customer/customer.model');
var Product = require('../product/product.model');
var utils = require('../../components/utils');

// Get list of orders
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
  
  // find costumer by name
  var fPromise = Q.when();
  if(query.where.name) {
    fPromise = Customer.find({ $or: [{ name: query.where.name }, { email: query.where.name }] }).select('_id').limit(limit).exec();
    delete query.where.name;
  }

  fPromise.then(function (customers) {
    if(customers) {
      query.where._customer = { $in: _.pluck(customers, '_id') };
    }
    return Q.all([
      Order.count(query.where).exec(),
      Order.find(query.where).populate('_customer').sort(query.sort).skip(skip).limit(limit).exec()
    ]).spread(function (total, orders) {
      res.set('X-Pagination-Total-Count', total);
      res.json(orders);
    });
  }).then(null, function (err) {
    console.log('error', err)
    handleError(res, err);
  });
};

// Get a single order
exports.show = function(req, res) {
  Order.findById(req.params.id).deepPopulate('_customer _items._product _items._product.materials').exec(function (err, order) {
    if(err) { return handleError(res, err); }
    if(!order) { return res.send(404); }
    return res.json(order);
  });
};

// Creates a new order in the DB.
exports.create = function(req, res) {
  var body = req.body;
  
  console.log('order', body);

  // var UserPromise;
  // if(body.user._id) {
  //   UserPromise = User.findById(body.user._id).exec();
  // } else {
  //   var account = _.pick(body.user, ['name', 'email', 'password']);
  //   UserPromise = User.create(account);
  // }

  // UserPromise.then(function (user) {
  //   return Customer.findOne({ _user: user._id }).exec()
  //     .then(function (customer) {
  //       if(customer) return customer;
  //       return Customer.create({ 
  //         // _user: user._id,
  //         name: user.name,
  //         address: body.user.address,
  //         city: body.user.city,
  //         phone: body.user.phone,
  //         postal_code: body.user.postal_code
  //       });
  //     });
  //   })
  
  var customerPromise;
  if(body._customer._id) {
    customerPromise = Customer.findById(body._customer._id).exec();
  } else {
    customerPromise = Customer.create(body._customer);
  }

  customerPromise
    .then(function (customer) {
      var q = Q.defer();
      
      var data = { _items: [], total: 0, _customer: customer._id };
      
      var promises = _.reduce(body._items, function (promise, orderitem) {
        return promise
        .then(function() {
          // return Product.findById(orderitem._id).select('materials').populate('materials._material').exec();
          return Q.when(orderitem._product);
        })
        .then(function (product) {
          var price = _.sum(product.materials, function (m) {
            return m.qty * m._material.price;
          });
          // console.log('orderitem', orderitem);
          // console.log('product', product);
          // console.log('price', price);
          // order item
          var item = {};
          item._product  = product._id;
          item.price     = price;
          item.qty       = orderitem.qty;
          item.total     = item.qty * price;
          // order total
          data.total += item.total;
          // product
          var minStock = -orderitem.qty;
          return Q.all([
            OrderItem.create(item),
            Product.update({ _id: product._id }, { $inc: { stock: minStock } }).exec()
          ]);
        })
        .then(function (result) {
          var item = result[0];
          data._items.push(item._id);
          return data;
        });
      }, q.promise);
      q.resolve();
      return promises;
    })
    .then(function (orderData) {
      return Order.create(orderData);
    })
    .then(function() {
      res.send(200);
    })
    .then(null, function (err) {
      console.log('error',err);
      res.json(500, err);
    });
};

// Updates an existing order in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Order.findById(req.params.id, function (err, order) {
    if (err) { return handleError(res, err); }
    if(!order) { return res.send(404); }
    var updated = _.merge(order, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, order);
    });
  });
};

// Deletes a order from the DB.
exports.destroy = function(req, res) {
  Order.findById(req.params.id, function (err, order) {
    if(err) { return handleError(res, err); }
    if(!order) { return res.send(404); }
    order.active = false;
    order.save(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
    // order.remove(function(err) {
    //   if(err) { return handleError(res, err); }
    //   return res.send(204);
    // });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}