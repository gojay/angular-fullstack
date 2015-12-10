(() => {
	'use strict';

	class ServiceCtrl {
		constructor($scope, $state, $q, $timeout, Auth, OurService, Appointment, logger) {
			this.$state = $state;
			this.$q = $q;
			this.$timeout = $timeout;
			this.OurService = OurService;
			this.Appointment = Appointment;
			this.logger = logger;

			this.title = {};

			this.all = [];
			this.services = [];
			this.model = {};
			this.model.service = {};
			this.model.user = Auth.getCurrentUser() || {};

			this.isCustomer = Auth.isCustomer;

			this.options = { 
				title: {
					'repairs': {
						1: {
							header: 'Device Repair',
							guide : 'Select your device',
						},
						3: {
							template: true,
							header: '<%= name %> Repair',
							guide : 'Select your <%= name %>',
							summary: 'Device'
						},
						4: {
							summary: 'Brand'
						},
						5: {
							summary: 'Model'
						}
					}
				},
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
					this.title = {
						header: 'Our Services',
						guide : 'Select a service'
					};
					return;
				}

				var service = _.first(nv).name.toLowerCase();
				var options = this.options.title[service];
				if(!options) return;

				var item = _.last(nv);
				var config  = options[this.services.length];
				if(!config) return;

				if(config.summary) {
					item.summary = config.summary;
				} else if(/repairs/i.test(service) && /inch/i.test(item.name)) {
					item.summary = 'Model';
				}

				if(config.template) {
					var compiledH = _.template(config.header);
					var compiledG = _.template(config.guide);
					this.title.header = compiledH({ name: item.name });
					this.title.guide = compiledG({ name: item.name });
				} else {
					angular.extend(this.title, _.pick(config, ['header', 'guide']));
				}
			}
		}

		_getServiceSummary() {
			if(_.isEmpty(this.services)) return;

			this.options.additionalService = true;
			this.title.header = 'Service Summary';
			this.title.guide = null;

			this._calcServiceEstimatePrice();
			this.$timeout(() => {
				this.logger.log('summary', angular.copy(this.services));

				this.model.summary = this.services.filter((s) => {
					return _.has(s, 'summary');
				}).reduce((arr, item) => {
					arr.push({
						title: item.summary,
						name: item.name
					});
					return arr;
				}, []);

				// var issue = _.last(this.services);
				// this.model.summary.push({
				// 	title: 'Issue',
				// 	name: issue.name
				// });
				
				this.logger.log('summary', this.model.summary);
			});
		}

		_calcServiceEstimatePrice() {
			if(_.isEmpty(this.services)) return;

			var params = { ids: [] };
			// get original service id
			var originService = _.find(this.services, (s) => {
				return _.has(s, 'reference');
			});
			if(originService) {
				params.ids.push(originService._id)
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
				this.items = data;
			}).catch((err) => {
				this.logger.error('Failed', 'load services', err);
			});
		}

		getServiceChildren(item) {
			if(!_.find(this.services, '_id', item._id)) {
				this.services.push(_.pick(item, ['_id', 'name', 'children', 'reference']));
			}
			this.items = item.children;
			// end
			if(_.isEmpty(this.items)) {
				this.logger.log('get:service:childrenLend', item);
				// get reference services
				if(item.reference) {
					this._getOurService({ reference: item.reference });
				} 
				// get service summary
				else {
					this._getServiceSummary();
				}
			}
		}
		getServiceParent(item) {
			this.options.additionalService = true;

			if(item === 'all') {
				this.items = this.all;
				this.services = [];
				return;
			}

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

	ServiceCtrl.$inject = ['$scope', '$state', '$q', '$timeout', 'Auth', 'OurService', 'Appointment', 'logger'];

	angular.module('app.guest')
	  .controller('ServiceCtrl', ServiceCtrl);

})();
