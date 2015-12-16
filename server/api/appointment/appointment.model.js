'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));
var Schema = mongoose.Schema;

var strftime = require('strftime');
var _ = require('lodash');
var moment = require('moment');

var User = require('../user/user.model');

var AppointmentSchema = new Schema({
    code: {
        type: String,
        unique: true,
        required: true
    },
    person: {
        type: Schema.Types.ObjectId,
        ref: 'Person'
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
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    contact: {
        name: String,
        email: { 
            type: String, 
            lowercase: true 
        },
        phone: String
    },
    pickup: {
        time: Date,
        location: {
            address1: String,
            address2: String,
            city: String,
            zipcode: String,
            additional: String
        }
    },
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
            this.count(query.where).execAsync(),
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
            ]).sort(query.sort).skip(query.skip).limit(query.limit).execAsync()
        ]);
    },

    getDisabledPickup(params, format = 'DD-MM-YYYY') {
        return this.aggregate([
            // { $match: params },
            { $match: { status: { $lte: 1 } } },
            { $group: { _id: '$pickup.time' } },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, date: '$_id' } }
        ]).execAsync().then((appointments) => {
            if(_.isEmpty(appointments)) return [];
            return _.map(appointments, (o) => {
                return moment(o.date).format(format);
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
        if(!body) throw new Error('Body undefined!');

        if(!body.user) throw new Error('user is required');
        if(!body.pickup || !body.pickup.hasOwnProperty('time')) throw new Error('pickup time is required');
        if(!body.service) throw new Error('service is required');

        var appointment = _.omit(body, ['user', 'address', '_address']);

        var userAsync;
        // find or update user
        if (body.user._id) {
            // new address
            if (body._address) {
                // set appointment address
                appointment.address = body._address;
                // add new address
                var where  = { _id: mongoose.Types.ObjectId(body.user._id) },
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
                userAsync = User.findById(body.user._id).select('name email phone address').execAsync()
                    .then((user) => {
                        var address = user.address[0];
                        // set appointment pickup location
                        appointment.pickup.location = {
                            address1  : address.address1,
                            address2  : address.address2,
                            city      : address.city,
                            zipcode   : address.zipcode,
                            additional: address.additional
                        };
                        return user;
                    });
            }
        }
        // return user
        else {
            appointment.pickup.location = body.address || body._address;
            userAsync = Promise.resolve(body.user);
        }

        return userAsync.then((user) => {
            if (!user) throw new Error('User not found!');
            if(user._id) appointment.user = user._id;
            appointment.contact = _.pick(user, ['name', 'email', 'phone']);
            appointment.service.id = mongoose.Types.ObjectId(appointment.service.id);
            if(appointment.service.reference) mongoose.Types.ObjectId(appointment.service.reference);
            return this._createWithGenerateCode(appointment);
        });
    },

    setUser(body) {
        if(!body || !body.id) throw new Error('Appointment id required!');
        if(!body.user) throw new Error('Appointment user required!');

        return this.findByIdAsync(body.id)
            .then((appointment) => {
                if(!appointment) throw new Error('Appointment not found!!');
                if(appointment.user || appointment.contact.email != body.user.email) throw new Error('Appointment not match with this user!!');
                appointment.user = body.user._id;
                return appointment.saveAsync();
            });
    }
};

module.exports = mongoose.model('Appointment', AppointmentSchema);
