'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));
var Schema = mongoose.Schema;
var tree = require('mongoose-path-tree');
var _ = require('lodash');
var Q = require('q');

var ServiceSchema = new Schema({
  name: String,
  price: { type: Number, default: 0 },
  picture: String,
  description: String,
  mode: { 
    type: Number,
    enum: [0, 1, 2], 
    default: 0
  },
  reference: Schema.Types.ObjectId,
  isRoot: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
});

ServiceSchema.path('name')
  .set(function (name) {
    return _.capitalize(name);
  });

ServiceSchema.statics = {
  getAll() {
    return this.find({ isRoot: true }).sort({ _id: -1 }).exec().then((roots) => {
      if(_.isEmpty(roots)) return [];
      var promises = roots.map((root) => {
        return root.getChildrenAsync({ fields: '_id name picture isRoot mode description reference' }).then((result) => {
          var obj = root.toObject();
          obj.children = result;
          return obj;
        });
      });
      return Q.all(promises);
    });
  },

  getPrimary(parent = 'Services') {
    return this.findOne({ name: parent, isRoot: true }).select('_id').exec()
      .then((root) => {
        if(!root) return [];
        return this.find({ parent: root._id }).select('name price mode').exec();
      });
  },

	getChildren(reference) {
    var filters = { isRoot: true };
    if(_.isEmpty(reference)) {
      filters.name = 'Services';
    } else {
      filters._id = mongoose.Types.ObjectId(reference);
    }

    return Q.delay(1000).then(() => {
      return this.findOne(filters).exec().then((root) => {
        if(!root) return [];
        return root.getChildrenAsync();
      });
    });
  },

  // @private
  _getEstimatePrice(id) {
    return this.findById(id).exec()
      .then((service) => {
        if(_.isEmpty(service)) return { items: [], estimate_price: 0 };
        return service.getAncestorsAsync('name price')
          .then((ancestors) => {
            ancestors.push(_.pick(service, ['_id','name', 'price']));
            return { items: ancestors, estimate_price: _.sum(ancestors, 'price') };
          });
      });
  },

	getEstimatePrice(params) {
    if(_.isEmpty(params) || !params.origin) {
      throw new Error('Can\'t estimated price!!');
    }

    var promises = [];

    // get estimate price from reference first!!
    if(params.reference) {
      promises.push(this._getEstimatePrice(params.reference));
    } else {
      promises.push(Q.when({ items: [], estimate_price: 0 }));
    }

    // get estimate price from origin
    promises.push(this._getEstimatePrice(params.origin));

    return Q.all(promises).then((estimates) => {
      var data = _.reduce(estimates, (obj, item, index) => {
        Array.prototype.push.apply(obj.items, item.items);
        obj.estimate_price += item.estimate_price;
        return obj;
      }, { items: [], estimate_price: 0 });
      data.id = params.origin;
      data.reference = params.reference;
      data.step = _.pluck(data.items, 'name');
      return data;
    });
	},

  add(data) {
    if(!data.parent) return this.create(data);
    return this.findById(data.parent).exec().then((parent) => {
      if(!parent) throw new Error('Parent not found');
      var newService = _.pick(data, ['name', 'price'])
      var service = new this(newService);
      service.parent = parent;
      return service.savePromise();
    });
  }
};

ServiceSchema.methods = {
	savePromise() {
    return Q.Promise((resolve, reject) => {
    	this.save((err, result) => {
      	if(err) return reject(err);
      	resolve(result);
    	});
    });
	},

  getChildrenAsync(_params_ = {}) {
    var params = _.merge({ fields: '_id name price picture isRoot mode description reference' }, _params_);
    return Q.Promise((resolve, reject) => {
      this.getChildrenTree(params, (err, result) => {
        if(err) {
          reject(err)
        } else {
          resolve(result);
        }
      });
    })
  },

  getAncestorsAsync(fields) {
    var select = fields || '_id name price isRoot mode description reference';
    return Q.Promise((resolve, reject) => {
      this.getAncestors({ isRoot: false }, 'name price', (err, result) => {
        if(err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }
};

ServiceSchema.plugin(tree, {
  pathSeparator : '#',              // Default path separator
  onDelete :      'REPARENT',       // Can be set to 'DELETE' or 'REPARENT'. Default: 'REPARENT'
  // numWorkers:     5,           			// Number of stream workers
  idType:         Schema.ObjectId  	// Type used for _id. Can be, for example, String generated by shortid module
});

module.exports = mongoose.model('Service', ServiceSchema);
