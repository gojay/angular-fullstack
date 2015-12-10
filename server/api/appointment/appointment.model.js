'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));
var Schema = mongoose.Schema;

var strftime = require('strftime');
var _ = require('lodash');
var Q = require('q');

var User = require('../user/user.model');

var AppointmentSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'/*,
        required: true*/
    },
    name: String,
    email: String,
    phone: String,
    address: Schema.Types.Mixed,
    person: {
        type: Schema.Types.ObjectId,
        ref: 'Person'
    },
    code: {
        type: String,
        unique: true,
        required: true
    },
    service: {
        id: {
            type: Schema.Types.ObjectId,
            ref: 'Service',
            required: true
        },
        lists: [],
        estimate_price: Number
    },
    pickuptime: Date,
    price: Number,
    additional_info: String,
    status: {
        type: Number,
        enum: [0, 1, 2, 3, 4],
        default: 0
    },
    created: {
        type: Date,
        default: Date.now
    },
    updated: Date,
    active: {
        type: Boolean,
        default: true
    }
});

AppointmentSchema.statics = {
    STATUS: ['Manifested', 'Pickup scheduled', 'In Progress', 'Complete', 'Cancelled'],

    add(body) {
        var appointment = _.omit(body, ['user', 'address', '_address']);
        var userPromise;

        // find or update user
        if (body.user._id) {
            // new address
            if (body._address) {
                userPromise = Q.Promise(function (resolve, reject) {
                    User.findOneAndUpdate({
                        _id: ObjectId(body.user._id)
                    }, {
                        $addToSet: {
                            address: body._address
                        }
                    }, function (err, user) {
                        if (err) {
                            reject(err);
                        } else {
                            appointment.address = body._address;
                            resolve(user);
                        }
                    });
                });
            }
            // current address
            else if (body.address) {
                appointment.address = body.address;
                userPromise = Q.when(body.user);
            }
            // get adress from user profile
            else {
                userPromise = User.findById(body.user._id).select('name email address').exec().then(function (user) {
                    var address = user.address[0];
                    appointment.address = {
                        city: address.city,
                        street: address.street,
                        zipcode: address.zipcode,
                        additional: address.additional
                    };
                    return user;
                });
            }
        }
        // create user
        else {
            var address = body.address || body._address;
            if (address) {
                appointment.address = address;
                body.user.address = _.isArray(address) ? address : [address];
            }
            userPromise = User.create(body.user);
        }

        userPromise.then((user) => {
            if (!user) throw 404;
            appointment.user = user._id;
            appointment.service.id = mongoose.Types.ObjectId(appointment.service.id);
            // appointment.name = user.name;
            // appointment.email = user.email;
            return this.createWithGenerateCode(appointment);
        });
    },

    createWithGenerateCode(data) {
        var date = new Date(),
            y = date.getFullYear(),
            m = date.getMonth(),
            d = date.getDate();

        return this.count({
            'created': {
                '$gte': new Date(y, m, d),
                '$lt': new Date(y, m, d + 1)
            }
        }).exec().then((counter) => {
            data.code = 'BO' + strftime('%y%m%d') + ('0000' + (counter + 1)).substr(-4, 4);
            return this.create(data);
        });
    }
};

module.exports = mongoose.model('Appointment', AppointmentSchema);
