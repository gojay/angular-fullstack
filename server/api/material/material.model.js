'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Q = require('q');

var MaterialSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: String,
  created: { type: Date, default: Date.now },
  active: { type: Boolean, default: true }
});

MaterialSchema.methods = {
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

module.exports = mongoose.model('Material', MaterialSchema);