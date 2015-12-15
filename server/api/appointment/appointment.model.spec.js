'use strict';

import _ from 'lodash';
import Q from 'q';
import moment from 'moment';
import Appointment from './appointment.model';
import User from '../user/user.model';
import Service from '../service/service.model';

import faker from 'faker';

describe.only('Appointment Model :', function() {
  this.timeout(600000);
	var appointment;

	const HOUR_TIMES = [10, 14, 17]; // 10AM, 2PM, 5PM
	const DAYS = [1,2,3]; // 10AM, 2PM, 5PM

	describe('Booking', () => {
	  function getService() {
	  	return Q.all([
		  	Service.findOne({ name: 'Front glass replacement' }).select('_id').execAsync(),
		    Service.findOne({ name: 'Galaxy Alpha' }).select('_id').execAsync()
			]).spread((issue, item) => {
				return Service.getEstimatePrice({
					origin: item._id.toString(),
		    	reference: issue._id.toString() 
				});
			});
	  }

	  function getUserAndAddress(params = {}) {
	  	var user = {
	  		name: faker.name.findName(),
	  		email: faker.internet.email(),
	  		phone: faker.phone.phoneNumberFormat()
	  	};
	  	var address = {
	  		city: faker.address.city(),
		    street: [faker.address.streetAddress(), faker.address.streetName()].join(' '),
		    zipcode: faker.address.zipCode()
	  	};

	  	if(params.user) {
	  		return User.findOne({ role: 'customer' }).select('name email phone').execAsync()
	  			.then((_user_) => {
	  				if(!_user_) {
	  					var newUser = new User();
	  					newUser.name = user.name;
	  					newUser.email = user.email;
	  					newUser.phone = user.phone;
	  					newUser.address = [address];
	  					return newUser.saveAsync().spread((_newUser_) => {
	  						return { user: _newUser_ };
	  					});
	  				}

	  				if(params.address) {
					  	return { user: _user_, address };
	  				}
	  				return { user: _user_ };
	  			});
	  	}
	  	return Promise.resolve({ user, address });
	  }

	  async function buildAppointment(params) {
	  	var service = await getService();
	  	var {user, address} = await getUserAndAddress(params);
	  	var pickuptime  = moment({ h:_.random(HOUR_TIMES), m:0, s:0 }).add(_.random(DAYS), 'd').toDate();
	  	return {service, user, address, pickuptime};
	  }

	  describe('new user', () => {
		  before((done) => {
		  	Q.all([
		  		User.remove({ role: 'customer' }).execAsync(),
		  		Appointment.remove().execAsync()
	  		])
	  		.then(() => {
	  			return buildAppointment();
	  		})
		  	.then((_appointement_) => {
		  		appointment = _appointement_;
		  	})
		  	.catch((err) => {
		  		console.log('error', err);
		  	})
		  	.finally(done);
		  });

		  it('should has appointment', () => {
		  	// console.log(JSON.stringify(appointment, null, 2));
		  });

		  describe('Booked', () => {
		  	var booked;
		  	before((done) => {
			  	Appointment.booking(appointment)
				  	.then((result) => {
				  		booked = result;
				  	})
				  	.catch((err) => console.log('booking:failed', err))
				  	.finally(done);
		  	});

			  it('the result should be an instanceOf Object', () => {
		  		// console.log('booked', JSON.stringify(booked, null, 2));
		  		booked.should.be.an.instanceOf(Object);
			  });

			  it('should have appointment code', () => {
			  	booked.code.should.be.an.instanceOf(String);
			  });

			  it('should not create an account', (done) => {
			  	_.has(booked, 'user').should.be.false;
			  	User.count({ role: 'customer' }).execAsync()
			  		.then((total) => {
			  			total.should.equal(0);
			  		})
			  		.finally(done);
			  });

			  it('should be booked', () => {
			  	booked.name.should.equal(appointment.user.name);
			  	booked.email.should.equal(appointment.user.email.toLowerCase());
			  	booked.phone.should.equal(appointment.user.phone);
			  	booked.address.should.eql(appointment.address);
			  });

			  describe('create an account after book appointment', () => {
			  	var newUser;

			  	before((done) => {
  					var _user_ = new User();
  					_user_.name = appointment.user.name;
  					_user_.email = appointment.user.email;
  					_user_.phone = appointment.user.phone;
  					_user_.address = [appointment.address];
  					return _user_.saveAsync().spread((_newUser_) => {
  						newUser = _newUser_;
  					}).finally(done);
			  	});

			  	it('should account created & have booking id', () => {
			  		_.has(booked, '_id').should.be.true;
			  		_.has(newUser, '_id').should.be.true;
			  		newUser.should.be.an.instanceOf(Object);
			  	});

			  	it('should set user to appointment', (done) => {
			  		Appointment.setUser({ id: booked._id, user: newUser })
			  			.then((result) => {
			  				// console.log('appointment', JSON.stringify(result, null, 2));
			  				result.should.be.an.instanceOf(Object);
			  			})
			  			.finally(done);
			  	});

			  });

		  });
	  });

		describe('returning user', () => {
			var appointment;

			describe('Direct', () => {
				
				before((done) => {
		  		buildAppointment({ user: true }).then((_appointment_) => {
		  			appointment = _appointment_;
		  		}).finally(done);
				});

				it('should has appointment', () => {
			  	// console.log(JSON.stringify(appointment, null, 2));
			  });

			  describe('Booked', () => {
			  	var booked;
			  	before((done) => {
				  	Appointment.booking(appointment)
					  	.then((result) => {
					  		booked = result;
					  	})
					  	.catch((err) => console.log('booking:failed', err))
					  	.finally(done);
			  	});

				  it('the result should be an instanceOf Object', () => {
			  		// console.log('booked', JSON.stringify(booked, null, 2));
			  		booked.should.be.an.instanceOf(Object);
				  });

				  it('should have appointment code', () => {
				  	booked.code.should.be.an.instanceOf(String);
				  });

				  it('should be booked', () => {
				  	booked.user.toString().should.equal(appointment.user._id.toString());
				  	booked.name.should.equal(appointment.user.name);
				  	booked.email.should.equal(appointment.user.email.toLowerCase());
				  	booked.phone.should.equal(appointment.user.phone);
				  });

				  it('should have 2 appointments', (done) => {
				  	Appointment.count({ email: appointment.user.email.toLowerCase() }).execAsync()
				  		.then((total) => {
				  			total.should.equal(2);
				  		})
				  		.finally(done);
				  });
			  });
			});

			describe('New Address', () => {
				before((done) => {
		  		buildAppointment({ user: true, address: true }).then((_appointment_) => {
		  			appointment = _.omit(_appointment_, 'address');
		  			appointment._address = _appointment_.address;
		  		}).finally(done);
				});

				it('should has appointment', () => {
			  	// console.log(JSON.stringify(appointment, null, 2));
			  });

			  describe('Booked', () => {
			  	var booked;
			  	before((done) => {
				  	Appointment.booking(appointment)
					  	.then((result) => {
					  		booked = result;
					  	})
					  	.catch((err) => console.log('booking:failed', err))
					  	.finally(done);
			  	});

				  it('the result should be an instanceOf Object', () => {
			  		// console.log('booked', JSON.stringify(booked, null, 2));
			  		booked.should.be.an.instanceOf(Object);
				  });

				  it('should have appointment code', () => {
				  	booked.code.should.be.an.instanceOf(String);
				  });

				  it('should appointment booked', () => {
				  	booked.user.toString().should.equal(appointment.user._id.toString());
				  	booked.name.should.equal(appointment.user.name);
				  	booked.email.should.equal(appointment.user.email.toLowerCase());
				  	booked.phone.should.equal(appointment.user.phone);
				  	booked.address.should.equal(appointment._address);
				  });

				  it('should user have new address', (done) => {
				  	User.findById(booked.user).lean().select('address.street address.city address.zipcode').execAsync()
				  		.then((user) => {
				  			user.address.should.have.lengthOf(2);
				  			_.last(user.address).should.eql(appointment._address);
				  		})
				  		.finally(done);
				  });

				  it('should have 3 appointments', (done) => {
				  	Appointment.count({ user: appointment.user._id }).execAsync()
				  		.then((total) => {
				  			total.should.equal(3);
				  		})
				  		.finally(done);
				  });
			  });
			})
		});
	});

	describe('Pickup time', () => {
		var user;
		before((done) => {
			User.findOne({ role: 'customer' }).select('name email').execAsync()
				.then((_user_) => {
					user = _user_;
				})
				.finally(done);
		});

		it('should get disable pickuptime', (done) => {
			Appointment.getDisabledPickup({ user: user._id })
				.then((dates) => {
					console.log(dates);
					dates.should.be.an.instanceOf(Array);
				})
				.finally(done);
		});
	});
});