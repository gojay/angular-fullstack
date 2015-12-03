'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Q = require('q');

var ProductSchema = new Schema({
  	materials: [{ 
      _material: { type: Schema.Types.ObjectId, ref: 'Material', required: true },
      qty: { type: Number, required: true }
    }],
  	sku : { type: String, required: true, index: true },
  	name: { type: String, required: true },
  	stock: Number,
  	// weight: Number,
  	description: String,
  	created: { type: Date, default: Date.now },
    active: { type: Boolean, default: true }
});

ProductSchema.methods = {
	savePromise: function() {
	    var self = this;
	    return Q.Promise(function (resolve, reject) {
	      	self.save(function (err, result) {
	        	if(err) return reject(err);
	        	resolve(result);
	      	});
	    });
  	}
}

module.exports = mongoose.model('Product', ProductSchema);