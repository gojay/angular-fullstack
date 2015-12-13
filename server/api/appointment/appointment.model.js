'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));
var Schema = mongoose.Schema;

var strftime = require('strftime');
var _ = require('lodash');
var moment = require('moment');

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
        reference: {
            type: Schema.Types.ObjectId,
            ref: 'Service'
        },
        items: [],
        step : [],
        estimate_price: Number
    },
    pickuptime: Date,
    price: Number,
    additional_info: String,
    status: {
        type: Number,
        enum: [0, 1, 2, 3, 4, 5],
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
    STATUS: ['Manifested', 'Pickup scheduled', 'In Progress', 'Completed', 'Cancelled', 'Notified'],

    paginate(query) {
        return Promise.all([
            this.count(query.where).exec(),
            this.find(query.where).populate([
                {
                    path: 'user',
                    select: 'name email phone'
                }, 
                {
                    path: 'service.id',
                    select: 'name price description'
                }, 
                {
                    path: 'service.reference',
                    select: 'name price description'
                }, 
                {
                    path: 'person'
                }
            ]).sort(query.sort).skip(query.skip).limit(query.limit).exec()
        ]);
    },

    getDisabledPickup(params, format) {
        return this.findAsync(params).select('pickuptime').then((appointments) => {
            if(_.isEmpty(appointments)) return [];
            return _.map(appointments, (o) => {
                return moment(o.pickuptime).format(format);
            });
        });
    },

    _createWithGenerateCode(data) {
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
    },

    booking(body) {
        var appointment = _.omit(body, ['user', 'address', '_address']);
        var userAsync;

        // find or update user
        if (body.user._id) {
            // new address
            if (body._address) {
                // set appointment address
                appointment.address = body._address;
                // add new address
                var where  = { _id: ObjectId(body.user._id) },
                    update = { $addToSet: { address: body._address } };
                userAsync = User.findOneAndUpdateAsync(where, update);
            }
            // current address
            else if (body.address) {
                // set appointment address
                appointment.address = body.address;
                userAsync = Promise.resolve(body.user);
            }
            // get adress from user profile
            else {
                userAsync = User.findByIdAsync(body.user._id).select('name email address').then(function (user) {
                    var address = user.address[0];
                    // set appointment address
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
            userAsync = User.create(body.user);
        }

        userAsync.then((user) => {
            if (!user) throw new Error('User not found!');
            appointment.user  = user._id;
            appointment.name  = user.name;
            appointment.email = user.email;
            appointment.phone = user.phone;
            appointment.service.id = mongoose.Types.ObjectId(appointment.service.id);
            return this._createWithGenerateCode(appointment);
        });
    }
};

module.exports = mongoose.model('Appointment', AppointmentSchema);
