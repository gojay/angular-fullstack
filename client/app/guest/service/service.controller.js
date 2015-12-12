(() => {
	'use strict';

	class ServiceCtrl {
		constructor($scope, $state, $q, $timeout, Auth, OurService, Appointment, logger, Modal, CONFIG) {
			this.$state = $state;
			this.$q = $q;
			this.$timeout = $timeout;
			this.OurService = OurService;
			this.Appointment = Appointment;
			this.logger = logger;
			this.Modal = Modal;

			this.title = {};

			this.all = [];
			this.services = [];
			this.model = {};
			this.model.service = {};
			this.model.user = Auth.getCurrentUser() || {};

			this.isCustomer = Auth.isCustomer;

			this.config = { 
				// title: CONFIG.service, 
				mode: 0, // column, tab, modal
				summary: {},
				appointment: false, 
				loading: false, 
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

			var unWatchServices = $scope.$watch(() => this.services, this._getTitle(), true);
			$scope.$on('$destroy', unWatchServices);
		}

		getColumnClass(items) {
			if(!_.isEmpty(items)) {
				if(items.length == 1) {
					return 'col-md-12';
				} else if(items.length == 2) {
					return 'col-md-6';
				} else if(items.length == 3) {
					return 'col-md-4';
				} else {
					return 'col-md-3';
				}
			} else {
				return 'col-md-3';
			}
		}

		_getTitle() {
			return (nv) => {

				// watch services
				// -------------------
				if(_.isEmpty(nv)) {
					this.title = {
						header: 'Our Services',
						guide : 'Select a service'
					};
					return;
				}

				var item = _.last(nv);
				var service_type = _.first(nv).name.toLowerCase();
				if(service_type == 'repairs') {
					switch(nv.length) {
						case 1:
							this.title.header = 'Device Repair';
							this.title.guide = 'Select your device';
							break;
						case 2:
							this.title.header = `${item.name} Repair`;
							this.title.guide = `Select your ${item.name.toLowerCase()}`;
							this.config.summary['Device'] = item.name;
							break;
						case 3:
							this.title.header = 'Select Device Issue';
							this.title.guide = `${item.parent} ${item.name}`;
							this.config.summary['Brand'] = item.parent;
							this.config.summary['Model'] = item.name;
							break;
						case 4:
							this.config.summary['Issue'] = item.name;
							break;
					}
				}
			}
		}

		_getServiceSummary() {
			if(_.isEmpty(this.services)) return;

			this.title.header = 'Service Summary';
			this.title.guide = null;

			this._calcServiceEstimatePrice();
		}

		_calcServiceEstimatePrice() {
			if(_.isEmpty(this.services)) return;

			var params = {};
			// get last service
			params.origin = _.last(this.services)._id;
			// get reference service id
			var referenceService = _.find(this.services, (s) => {
				return _.has(s, 'reference');
			});
			if(referenceService) {
				params.reference = referenceService._id;
			}

			// this.logger.log('estimate_price', params);

			this.config.calculating = true;
			return this.OurService.calculate(params).$promise.then((result) => {
				angular.extend(this.model.service, result);
				// this.logger.log('service', this.model.service);
				// this.model.price = result.estimate_price;
			}).catch((err) => {
				this.logger.error('Failed', 'calculating estimate price', err);
			}).finally(() => {
				this.config.calculating = false;
			})
		}

		_getOurService(item) {
			var query = { type: 'children' };
			if(item) angular.extend(query, { reference: item.reference });
			this.config.loading = true;
			this.OurService.query(query).$promise.then((data) => {
				if(!item) {
					angular.extend(this.all, data);
				} 
				// reference, show in tabs
				else {
					var seviceitem = _.last(this.services);
					seviceitem.mode = 1;
					seviceitem.children = data;
					this.config.mode = 1;
				}
				this.items = data;
			}).catch((err) => {
				this.logger.error('Failed', 'load services', err);
			}).finally(() => {
				this.config.loading = false;
			});
		}

		_addToService(item, parent) {
			if(!_.find(this.services, '_id', item._id)) {
				var next = _.pick(item, ['_id', 'name', 'mode', 'children', 'reference']);
				if(parent) next.parent = parent.name;
				this.services.push(next);
			}
			this.items = item.children;
			// end
			if(_.isEmpty(this.items)) {
				// get reference services
				if(item.reference) {
					this._getOurService(item);
				} 
				// get service summary
				else {
					this._getServiceSummary();
				}
			}
		}

		getServiceChildren(item, parent) {
			// show in modal
			if(item.mode == 2) {
				return this.Modal.list({
					templateUrl: 'select-screen-size.html',
					model: item.children,
					windowClass: 'modal-service'
				}, (selected) => {
	        // this.logger.log('size', selected);
					this._addToService(selected, parent);
		    })(['Select screen size']);
			}

			// set view mode
			this.config.mode = item.mode;

			this._addToService(item, parent);
		}
		getServiceParent(item) {
			if(item === 'all') {
				this.items = this.all;
				this.services = [];
				return;
			}

			// set view mode
			this.config.mode = item.mode;

			if(_.last(this.services)._id == item._id) return;

			var is = _.findIndex(this.services, { _id: item._id });
			if(is > -1) {
				this.items = angular.copy(this.services[is].children);
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
			if(nextStep == 'step0') {
				this.config.appointment = false;
			} else {
				this.config.appointment = true;
				this.$state.go(`service.appointment.${nextStep}`);
			}
		}

		/* Appointment Form */

		getFormClass(field) {
			if(field.$dirty || this.config.submitted) return field.$valid ? 'has-success' : 'has-error' ;
			return null;
		}
		isInteracted(field) {
			return this.config.submitted || field.$dirty;
		}
		nextStep(form, nextStep) {
			this.config.submitted = true;
			if(form.$invalid) return;
			this.config.submitted = false;
			this.$state.go(`service.appointment.${nextStep}`);
		}

		/* Appointment Step 2 : Date Picker */

    _getDisabledDP() {
        if (_.isEmpty(this.model.user._id)) return;
        if (!_.isEmpty(this.config.datePicker.disabled)) return;

        this.Appointment.getDisabledPickup().$promise.then((results) => {
            this.config.datePicker.disabled = results;
            // return this.config.datePicker.disabled;
        }).catch((error) => {
            this.logger.log('_getDisabledDP:error', error);
        });
    }
  	openDP($event) {
        $event.preventDefault();
        $event.stopPropagation();
        this.config.datePicker.opened = true;
        if (!this.model.pickuptime) {
            this.model.pickuptime = moment().format('DD-MMMM-YYYY');
        }
    }
    clearDP() {
        this.model.pickuptime = null;
    }
    disabledDP(date, mode) {
        var d = moment(date).format('DD-MM-YYYY');
        return this.config.datePicker.disabled.indexOf(d) > -1;
    }

		/* Appointment Step 3 */

		getAppointmentDate() {
			return moment().format('MMMM DD, YYYY');
		}

		getOrderSummary() {
			return _.filter(this.model.service.items, (service) => {
				return service.price > 0;
			});
		}

		bookAppointment() {
			this.logger.info('Appointment', 'Booking', this.model);
		}
	}

	ServiceCtrl.$inject = ['$scope', '$state', '$q', '$timeout', 'Auth', 'OurService', 'Appointment', 'logger', 'Modal', 'CONFIG'];

	angular.module('app.guest')
	  .controller('ServiceCtrl', ServiceCtrl);

})();
