(() => {
	'use strict';

	class ServiceCtrl {
		constructor($scope, $state, $q, $timeout, Auth, OurService, Appointment, logger, Modal) {
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

			this._getOurService().then((data) => {
				angular.extend(this.all, data);
				this.items = data;
			});

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
			if(_.isEmpty(items)) return 'col-md-3';
			switch(items.length) {
				case 1:
					return 'col-md-12';
					break;
				case 2:
					return 'col-md-6';
					break;
				case 3:
					return 'col-md-4';
					break;
				default:
					return 'col-md-3';
					break;
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
				var service_type = _.first(nv).name;
				if(service_type.toLowerCase() == 'repairs') {
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
							if(item.parent) {
								this.config.summary['Brand'] = item.parent;
								item.name = `${item.parent} ${item.name}`;
								delete item.parent;
							}
							this.title.header = 'Select Device Issue';
							this.title.guide = `${item.name}`;
							this.config.summary['Model'] = item.name;
							break;
						case 4:
							this.config.summary['Issue'] = item.name;
							break;
					}
				}
				else if(/^setup/i.test(service_type)) {
					switch(nv.length) {
						case 1:
							this.title.header = item.name;
							this.title.guide = '';
							break;
						case 2:
							this.config.summary['Setup'] = item.name;
							break;
						case 3:
							if(item.parent) {
								this.config.summary['Type'] = `${item.parent} - ${item.name}`;
								delete item.parent;
							}
							break;
					}
				}
			}
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
			}).catch((err) => {
				this.logger.error('Failed', 'calculating estimate price', err);
			}).finally(() => {
				this.config.calculating = false;
			})
		}

		_getOurService(item) {
			this.config.loading = true;

			var query = { type: 'children' };
			if(item) angular.extend(query, { reference: item.reference });
			return this.OurService.query(query).$promise
				.catch((err) => { this.logger.error('Failed', 'load services', err) })
				.finally(()  => { this.config.loading = false; });
		}

		_addToService(item, parent) {
			this.items = item.children;

			// check duplicate, add to service
			if(!_.find(this.services, '_id', item._id)) {
				var next = _.pick(item, ['_id', 'name', 'mode', 'children', 'reference']);
				if(parent) next.parent = parent.name;
				this.services.push(next);
			}

			// end
			if(_.isEmpty(this.items)) {
				// get the reference services
				// show the references in tabs
				// add the references to the previous item
				if(item.reference) {
					return this._getOurService(item).then((references) => {
						var seviceitem = _.last(this.services);
						seviceitem.mode = 1;
						seviceitem.children = references;
						this.items = references;
						this.config.mode = 1;
					});
				} 
				// service summary
				// get estimate price
				this.title.header = 'Service Summary';
				this.title.guide = null;
				this.config.endService = true;
				this._calcServiceEstimatePrice();
			} else {
				this.config.endService = false;
			}
		}

		getServiceChildren(item, parent) {
			// show in modal
			if(item.mode == 2) {
				return this.Modal.list({
					templateUrl: 'select-screen-size.html',
					windowClass: 'modal-service',
					model: item.children
				}, 
				(selected) => this._addToService(selected, parent)) // resolve selected item, close modal
				(['Select screen size']);														// open modal with title
			}

			// set view mode
			this.config.mode = item.mode;
			// add to services
			this._addToService(item, parent);
		}
		getServiceParent(item) {
			this.config.endService = false;

			if(item === 'all') {
				this.items = this.all;
				this.services = [];
				this.config.summary = {};
				this.config.mode = 0;
				return;
			}

			// set view mode
			this.config.mode = item.mode;

			if(_.last(this.services)._id == item._id) return;
			var is = _.findIndex(this.services, { _id: item._id });
			if(is > -1) {
				this.items = angular.extend({}, this.services[is].children);
				_.remove(this.services, (n, k) => { return k > is; });
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

	ServiceCtrl.$inject = ['$scope', '$state', '$q', '$timeout', 'Auth', 'OurService', 'Appointment', 'logger', 'Modal'];

	angular.module('app.guest')
	  .controller('ServiceCtrl', ServiceCtrl);

})();
