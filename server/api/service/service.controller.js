/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/services              ->  index
 * POST    /api/services              ->  create
 * GET     /api/services/:id          ->  show
 * PUT     /api/services/:id          ->  update
 * DELETE  /api/services/:id          ->  destroy
 */

'use strict';

var mongoose = require('mongoose'),
    ObjectId = mongoose.Types.ObjectId;
var _ = require('lodash');

var Service = require('./service.model');

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    console.log('handleError', err);
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

// Gets a list of Services
exports.index = function(req, res) {
  var type = req.query.type;
  var promise;
  switch(type) {
    case 'primary':
      promise = Service.getPrimary();
      break;
    case 'children':
      promise = Service.getChildren(req.query.reference);
      break;
    default:
      promise = Service.getAll();
      break;
  }

  promise
    .then(responseWithResult(res))
    .then(null, handleError(res));
};

// Gets a single Service from the DB
exports.show = function(req, res) {
  Service.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(responseWithResult(res))
    .catch(handleError(res));
};

// Creates a new Service in the DB
exports.create = function(req, res) {
  Service.add(req.body)
    .then(responseWithResult(res, 201))
    .then(null, handleError(res));
};
// Creates a new Service in the DB
exports.parent = function(req, res) {
  var body = req.body;
  var service = new Service(req.body);
  service.saveAsync()
    .then(responseWithResult(res, 201))
    .then(null, handleError(res));
};

// Updates an existing Service in the DB
exports.update = function(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  Service.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(responseWithResult(res))
    .catch(handleError(res));
};

// Deletes a Service from the DB
exports.destroy = function(req, res) {
  Service.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
};

// calculate
exports.calculate = function(req, res) {
  Service.getEstimatePrice(req.body)
    .then(responseWithResult(res))
    .then(null, handleError(res));
};
