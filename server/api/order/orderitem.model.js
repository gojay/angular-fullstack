'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Q = require('q');

var OrderItemSchema = new Schema({
  	_product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  	price: Number,
  	qty: Number,
  	total: Number
});

OrderItemSchema.methods = {
	savePromise: function() {
	    var self = this;
	    return Q.Promise(function (resolve, reject) {
	      	self.save(function (err, result) {
	        	if(err) return reject(err);
	        	resolve(result);
	      	});
	    });
  	}
};

var deepPopulate = require('mongoose-deep-populate')(mongoose);
OrderItemSchema.plugin(deepPopulate, {
  populate: {
    '_product.materials._material': {
      select: 'name price description'
    }
  }
});

module.exports = mongoose.model('OrderItem', OrderItemSchema);