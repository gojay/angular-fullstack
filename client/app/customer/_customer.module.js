(() => {
	'use strict';

	class CustomerModuleCtrl {
		constructor() {
			this.menus = [{
				title: 'Dashboard',
				sref: 'customer.dashboard'
			},{
				title: 'History',
				sref: 'customer.history'
			},{
				title: 'Tracking',
				sref: 'customer.tracking'
			}];
		}
	}

	angular.module('app.customer', [])
		.config(($stateProvider) => {
			$stateProvider
	      .state('customer', {
	        url: '/customer',
	        abstract: true,
	        controller: 'CustomerModuleCtrl',
	        controllerAs: 'mod',
	        templateUrl: 'app/layout/_template-side-menu.html'
	      });
		})
		.controller('CustomerModuleCtrl', CustomerModuleCtrl);
	
})()