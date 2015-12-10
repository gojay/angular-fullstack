/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/appointments              ->  index
 * POST    /api/appointments              ->  create
 * GET     /api/appointments/:id          ->  show
 * PUT     /api/appointments/:id          ->  update
 * DELETE  /api/appointments/:id          ->  destroy
 */

'use strict';

var Appointment = require('./appointment.model');
var _ = require('lodash');
var Q = require('q');
var utils = require('../../components/utils');

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

function responseWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function saveUpdates(updates) {
  return function(entity) {
    var updated = _.merge(entity, updates);
    return updated.saveAsync()
      .spread(function(updated) {
        return updated;
      });
  };
}

function removeEntity(res) {
  return function(entity) {
    if (entity) {
      return entity.removeAsync()
        .then(function() {
          res.status(204).end();
        });
    }
  };
}

// Gets a list of Appointments
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
    Appointment.count(query.where).exec(),
    Appointment.find(query.where).lean().populate([{ 
      path: 'user', select: 'name email phone'
    }, { 
      path: 'service.id', select: 'name price description' 
    }, { 
      path: 'person' 
    }]).sort(query.sort).skip(skip).limit(limit).exec()
  ])
  .spread(function (total, results) {
    res.set('X-Pagination-Total-Count', total);
    res.status(200).json(results);
  })
  .then(null, handleError(res));
};

// Gets a single Appointment from the DB
exports.show = function(req, res) {
  Appointment.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(responseWithResult(res))
    .catch(handleError(res));
};

// Creates a new Appointment in the DB
exports.create = function(req, res) {
  var body = req.body;
  if(!body.user) return res.json(422, { message: 'user required!' });
  console.log('----------------------------------------');
  console.log('create:appointment', JSON.stringify(body, null, 2));
  console.log('----------------------------------------');
  Appointment.add(body)
    .then(responseWithResult(res, 201))
    .then(null, handleError(res));
};

// Updates an existing Appointment in the DB
exports.update = function(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  Appointment.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(responseWithResult(res))
    .catch(handleError(res));
};

// Deletes a Appointment from the DB
exports.destroy = function(req, res) {
  Appointment.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
};

exports.getDisabledPickup = function(req, res) {
  var user = req.user;
  var format = req.query.format || 'DD-MM-YYYY';
  Appointment.find({ user: user._id }).select('pickuptime').exec()
    .then(function (appointments) {
      if(_.isEmpty(appointments)) return [];
      var pickuptimes = _.map(appointments, function (o) {
        return moment(o.pickuptime).format(format);
      });
      res.status(200).json(pickuptimes);
    })
    .then(null, handleError(res));
}