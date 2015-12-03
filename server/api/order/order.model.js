'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Q = require('q');

var OrderSchema = new Schema({
  	_customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  	_items: [{ type: Schema.Types.ObjectId, ref: 'OrderItem' }],
  	code: String,
  	total: Number,
  	created: { type: Date, default: Date.now },
    active: { type: Boolean, default: true }
});

function makeCode() {
 	var text = "";
  	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  	for( var i=0; i < 5; i++ ) {
	    text += possible.charAt(Math.floor(Math.random() * possible.length));
  	}
 	return text;
}

OrderSchema
  .pre('save', function(next) {
    if (!this.isNew) return next();
    this.code = makeCode();
    next();
  });

OrderSchema.methods = {
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
OrderSchema.plugin(deepPopulate, {
  populate: {
    // '_customer': {
    //   select: 'name email created'
    // },
    '_items._product': {
      select: 'materials name sku stock'
    },
    '_items._product.materials._material': {
      select: 'name price description'
    }
  }
});

module.exports = mongoose.model('Order', OrderSchema);