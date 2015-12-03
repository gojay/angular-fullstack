'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Q = require('q');

var CustomerSchema = new Schema({
  	// _user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
  	email: { type: String, required: true },
  	address : { type: String, required: true },
  	city: String,
  	phone: String,
  	postal_code: String,
  	created: { type: Date, default: Date.now },
    active: { type: Boolean, default: true }
});

CustomerSchema.methods = {
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

module.exports = mongoose.model('Customer', CustomerSchema);