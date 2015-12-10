(() => {
	'use strict';

	class ServiceCtrl {
		constructor($scope, $state, $q, Auth, OurService, Appointment, logger) {
			this.$state = $state;
			this.$q = $q;
			this.OurService = OurService;
			this.Appointment = Appointment;
			this.logger = logger;

			this.all = [];
			this.services = [];
			this.model = {};
			this.model.service = {};
			this.model.user = Auth.getCurrentUser() || {};

			this.isCustomer = Auth.isCustomer;

			this.options = { 
				title: {},
				additionalService: false, 
				addNewAddress: false,
				calculating: false, 
				submitted: false,
				datePicker: {
			      	minDate: moment().add(1, 'd').toDate(),
			      	format: 'dd-MMMM-yyyy',
			      	opened: false,
			      	options: {
			        	formatYear: 'yy',
			        	startingDay: 1
			      	},
			      	disabled: []
				}
			};

			this._getOurService();

			$scope.$on('$stateChangeSuccess', (env, to) => {
				if(/appointment/.test(to.name) && _.isEmpty(this.services)) {
					this.$state.go('service');
					return;
				}
				this._getDisabledDP();
			});

			var unwatch = $scope.$watch(() => this.services, this._getTitle(), true);
			$scope.$on('$destroy', unwatch);
		}

		_getTitle() {
			return (nv) => {
				if(_.isEmpty(nv)) {
					this.options.title = {
						header: 'Our Services',
						guide : 'Select a service'
					};
					return;
				}

				var service = _.first(nv).name;
				if(!/repair/i.test(service)) return;

				var item = _.last(nv);
				var title = item.name;
				if(/inch/i.test(title)) {
					item.summary = 'Model';
				}
				switch(nv.length) {
					case 1:
						this.options.title.header = 'Device Repair';
						this.options.title.guide = 'Select your type';
						break;
					case 2:
						this.options.title.header = _.capitalize(title) + ' Repair';
						this.options.title.guide = 'Select your '+ title.toLowerCase();
						break;
					// device
					case 3:
						item.summary = 'Device';
						break;
					// brand
					case 4:
						item.summary = 'Brand';
						break;
					case 5:
						this.options.title.guide = 'Select screen size';
						break;
					case 6:
						var device = nv.slice(-3).map((i) => { return i.name; }).join(' ');
						this.options.title.header = 'Select Device Issue';
						this.options.title.guide = _.capitalize(device);
						break;
					case 8:
						this.options.title.header = 'Service Summary';
						this.options.title.guide = null;
						break;
				}
			}
		}

		_getServiceSummary() {
			if(_.isEmpty(this.services)) return;

			this.model.summary = this.services.filter((s) => {
				return s.hasOwnProperty('summary');
			}).reduce((result, item) => {
				result.push({
					title: item.summary,
					name: item.name
				});
				return result;
			}, []);

			var issue = _.last(this.services);
			this.model.summary.push({
				title: 'Issue',
				name: issue.name
			});
			this.logger.log('summary', this.model.summary);
		}

		_getServiceEstimatePrice(item) {
			if(_.isEmpty(this.services)) return;

			var params = { ids: [] };
			// get original service id
			var originServiceId = _.find(this.service, (s) => {
				return s.hasOwnProperty('reference');
			});
			if(originServiceId) {
				params.ids.push(originServiceId)
			}
			// get last service
			var serviceId = _.last(this.services)._id;
			params.ids.push(serviceId);

			this.logger.log('estimate_price', params);

			this.options.calculating = true;
			return this.OurService.calculate(params).$promise.then((result) => {
				this.logger.log('calculated', result);
				// angular.extend(this.model.service, result);
				// this.model.price = result.estimate_price;
			}).catch((err) => {
				this.logger.error('Failed', 'calculating services', err);
			}).finally(() => {
				this.options.calculating = false;
			})
		}

		_getOurService(params) {
			var query = { type: 'children' };
			if(params) {
				angular.extend(query, params);
			}
			this.OurService.query(query).$promise.then((data) => {
				if(!params) {
					angular.extend(this.all, data);
				}
				this.data = data;
			}).catch((err) => {
				this.logger.error('Failed', 'load services', err);
			});
		}

		getServiceChildren(item) {
			if(!_.find(this.services, '_id', item._id)) {
				this.services.push(_.pick(item, ['_id', 'name', 'children', 'reference']));
			}
			this.data = item.children;
			// end
			if(_.isEmpty(this.data)) {
				this.logger.log('get:service:childrenLend', item);
				// get reference services
				if(item.reference) {
					this._getOurService({ reference: item.reference });
				} 
				// get service summary & estimate price
				else {
					this.options.additionalService = true;
					this._getServiceSummary();
					this._getServiceEstimatePrice(item);
				}
			}
		}
		getServiceParent(item) {
			this.options.additionalService = true;

			if(item === 'all') {
				this.data = this.all;
				this.services = [];
				return;
			}

			if(_.last(this.services)._id == item._id) return;

			var is = _.findIndex(this.services, { _id: item._id });
			if(is > -1) {
				this.data = angular.copy(this.services[is].children);
				_.remove(this.services, (n, k) => {
					return k > is;
				});
			}
		}

		isActive(stepNumber) {
			var step = parseInt(stepNumber.match(/\d/)[0]);
			var currentStep = parseInt(this.$state.current.name.match(/\d/)[0]);
			return step <= currentStep;
		}
		goTo(nextStep) {
			this.options.additionalService = false;
			this.$state.go(`service.appointment.${nextStep}`);
		}

		/* Appointment Form */

		getFormClass(field) {
			if(field.$dirty || this.options.submitted) return field.$valid ? 'has-success' : 'has-error' ;
			return null;
		}
		isInteracted(field) {
			return this.options.submitted || field.$dirty;
		}
		nextStep(form, nextStep) {
			this.options.submitted = true;
			this.logger.log('next:step = %s', nextStep, form);
			if(form.$invalid) return;
			this.options.submitted = false;
			this.$state.go(`service.appointment.${nextStep}`);
		}

		/* Appointment Step 2 : Date Picker */

	    _getDisabledDP() {
	        if (_.isEmpty(this.model.user)) return;
	        if (!_.isEmpty(this.options.datePicker.disabled)) return;

	        this.Appointment.getDisabledPickup().$promise.then((results) => {
	            this.options.datePicker.disabled = results;
	            // return this.options.datePicker.disabled;
	        }).catch((error) => {
	            this.logger.log('_getDisabledDP:error', error);
	        });
	    }
      	openDP($event) {
	        $event.preventDefault();
	        $event.stopPropagation();
	        this.options.datePicker.opened = true;
	        if (!this.model.pickuptime) {
	            this.model.pickuptime = moment().format('DD-MMMM-YYYY');
	        }
	    }
	    clearDP() {
	        this.model.pickuptime = null;
	    }
	    disabledDP(date, mode) {
	        var d = moment(date).format('DD-MM-YYYY');
	        return this.options.datePicker.disabled.indexOf(d) > -1;
	    }

		/* Appointment Step 3 */

		getAppointmentDate() {
			return moment().format('MMMM DD, YYYY');
		}

		getOrderSummary() {
			return _.filter(this.model.service.lists, (service) => {
				return service.price > 0;
			});
		}

		bookAppointment() {
			this.logger.info('Appointment', 'Booking', this.model);
		}
	}

	ServiceCtrl.$inject = ['$scope', '$state', '$q', 'Auth', 'OurService', 'Appointment', 'logger'];

	angular.module('app.guest')
	  .controller('ServiceCtrl', ServiceCtrl);

})();
