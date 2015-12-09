(() => {
	'use strict';

	class ServiceCtrl {
		constructor($scope, $state, Auth, OurService, logger) {
			this.$state = $state;
			this.OurService = OurService;
			this.logger = logger;
			this.name = 'Services';

			this.all = [];
			this.services = [];
			this.model = {};
			this.model.user = Auth.getCurrentUser() || {};

			this.options = { additionalService: false, calculating: false };

			this.getOurService();

			$scope.$on('$stateChangeSuccess', (env, to) => {
				if(/appointment/.test(to.name) && _.isEmpty(this.services)) {
					this.$state.go('service');
				}
			});
		}

		getOurService() {
			this.OurService.query({ children: 1 }).$promise.then((data) => {
				angular.extend(this.all, data);
				this.data = data;
			}).catch((err) => {
				this.logger.error('Failed', 'load services', err);
			})
		}

		_getServiceCost(item) {
			// cek sudah pernah dikalkulasi
			if(_.isEmpty(this.services)) return;
			if(_.last(this.services)._id == item._id && this.model.price) return;

			this.options.calculating = true;
			return this.OurService.calculate({ _id: item._id }).$promise.then((result) => {
				this.model.estimatePrice = result;
				this.model.price = result.cost;
			}).catch((err) => {
				this.logger.error('Failed', 'calculating services', err);
			}).finally(() => {
				this.options.calculating = false;
			})
		}

		getChildrenService(item) {
			if(!_.find(this.services, '_id', item._id)) {
				this.services.push(_.pick(item, ['_id', 'name', 'children']));
			}
			this.data = item.children;
			if(_.isEmpty(this.data)) {
				this.options.additionalService = true;
				this._getServiceCost(item);
			}
		}

		getParentService(item) {
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

		goTo(stepNumber) {
			this.options.additionalService = false;
			this.$state.go(`service.appointment.${stepNumber}`);
		}

		getAppointmentDate() {
			return moment().format('MMMM DD, YYYY');
		}

		getOrderSummary() {
			return _.filter(this.model.estimatePrice.services, (service) => {
				return service.price > 0;
			});
		}

		bookAppointment() {
			this.logger.info('Appointment', 'Booking', this.model);
		}
	}

	ServiceCtrl.$inject = ['$scope', '$state', 'Auth', 'OurService', 'logger'];

	angular.module('app.guest')
	  .controller('ServiceCtrl', ServiceCtrl);

})();
