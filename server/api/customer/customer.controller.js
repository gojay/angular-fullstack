'use strict';

var _ = require('lodash');
var Q = require('q');
var mongoose = require('mongoose'),
    ObjectId = mongoose.Types.ObjectId;
var User = require('../user/user.model');
var Customer = require('./customer.model');
var utils = require('../../components/utils');

// Get list of customers
exports.index = function(req, res) {
  var page  = req.query.page || 1,
      limit = req.query.limit || 20,
      skip  = (page - 1) * limit;

  var defaultOR = [{
    active : { $exists: false },
  }, {
    active : {
      $exists: true,
      $eq: true
    }
  }];

  var query = utils.parseQuery(req.query);
  if(query.where.q) {
    // fPromise = User.find({ $or:[{ name: query.where.q }, { email: query.where.q }] }).select('_id').limit(limit).exec();
    var qOR = { $or:[{ name: query.where.q }, { email: query.where.q }] };
    query.where.$and = [defaultOR, qOR];
    delete query.where.q;
  } else {
    query.where.$or = defaultOR;
  }

  Q.all([
    Customer.count(query.where).exec(),
    Customer.find(query.where).sort(query.sort).skip(skip).limit(limit).exec()
  ])
  .spread(function (total, customers) {
    res.set('X-Pagination-Total-Count', total);
    res.json(200, customers);
  })
  .then(null, function (err) {
    handleError(res, err);
  })

  // find user by name/email
  /*var fPromise = Q.Promise(function(resolve) { resolve(); });
  if(query.where.q) {
    fPromise = User.find({ $or:[{ name: query.where.q }, { email: query.where.q }] }).select('_id').limit(limit).exec();
    delete query.where.q;
  }

  fPromise.then(function (users) {
    if(users) {
      query.where._user = { $in: _.pluck(users, '_id') };
    }
    return Q.all([
      Customer.count(query.where).exec(),
      Customer.find(query.where).populate([{ path: '_user', select: 'name email' }]).sort(query.sort).skip(skip).limit(limit).exec()
    ])
    .spread(function (total, customers) {
      res.set('X-Pagination-Total-Count', total);
      res.json(200, customers);
    });
  })
  .then(null, function (err) {
    handleError(res, err);
  });*/
};

// Get a single customer
exports.show = function(req, res) {
  Customer.findById(req.params.id).populate([{ path: '_user', select: 'name email' }]).exec(function (err, customer) {
    if(err) { return handleError(res, err); }
    if(!customer) { return res.send(404); }
    return res.json(customer);
  });
};

// Creates a new customer in the DB.
exports.create = function(req, res) {
  var body = req.body;
  Customer.create(body, function (err, customer) {
    if(err) { return handleError(res, err); }
    return res.json(201, customer);
  });
  // User.create(body._user, function(err, user) {
  //   if(err) { return handleError(res, err); }
  //   body._user = user._id;
  //   body.name = user.name;
  //   Customer.create(body, function(err, customer) {
  //     if(err) { return handleError(res, err); }
  //     return res.json(201, customer);
  //   });
  // })
};

// Updates an existing customer in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  
  // console.log('update', JSON.stringify(req.body, null, 2));

  Customer.findById(req.params.id).exec()
    .then(function (customer) {
      if(!customer) throw new Error('Customer not found');
      var updated = _.merge(customer, req.body);
      return updatedCustomer.savePromise();
    })
    .then(function () {
      res.send(200);
    }).then(null, function (err) {
      console.log('error', err);
      handleError(res, err);
    });

  /*Q.all([
    User.findById(req.body._user._id).exec(),
    Customer.findById(req.params.id).exec()
  ])
  .spread(function (user, customer) {
    if(!user) throw new Error('User not found');
    if(!customer) throw new Error('Customer not found');
    // update user
    delete req.body._user._id;
    var updatedUser  = _.merge(user, req.body._user);
    // console.log('update:user', JSON.stringify(updatedUser, null, 2));
    // update customer
    var uCustomer = _.omit(req.body, '_user');
    var updatedCustomer = _.merge(customer, uCustomer);
    // console.log('update:customer', JSON.stringify(updatedCustomer, null, 2));
    return Q.all([
      updatedUser.savePromise(),
      updatedCustomer.savePromise(),
    ]);
  }).then(function (results) {
    // console.log('results', JSON.stringify(results, null, 2));
    res.send(200);
  }).then(null, function (err) {
    console.log('error', err);
    handleError(res, err);
  });*/
};

// Deletes a customer from the DB.
exports.destroy = function(req, res) {
  Customer.findById(req.params.id).exec()
    .then(function (customer) {
      if(!customer) throw 404;

      customer.active = false;
      return Q.all([
        User.remove({ _id: customer._user }).exec(),
        customer.savePromise()
        // Customer.remove({ _id: customer._id }).exec()
      ]);
    })
    .then(function () {
      res.send(204);
    })
    .then(null, function (err) {
      handleError(res, err)
    })
};

exports.validator = function(req, res) {
  var query = req.query;
  var q = req.query.q;
  Customer.count({ email: q }).exec()
    .then(function(count) {
      var status = count ? 422 : 200 ;
      res.status(status).end();
    })
    .then(null, function(error) {
      res.json(500, error);
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

  Customer.find(filter).select('name email').sort({ name: 1 }).exec()
    .then(function (customers) {
      res.json(customers);
    })
    .then(null, function(err) {
      handleError(res, err);
    });
};

function handleError(res, err) {
  if(err === 404) return res.send(404);
  return res.send(500, err);
}