(() => {
	'use strict';

	class AdminModuleCtrl {
		constructor() {
			this.menus = [{
				title: 'Dashboard',
				sref: 'admin.dashboard'
			},{
				title: 'Material',
				sref: 'admin.material.index'
			},{
				title: 'Product',
				sref: 'admin.product.index'
			},{
				title: 'Order',
				sref: 'admin.order.index'
			},{
				title: 'Customer',
				sref: 'admin.customer.index'
			}];
		}
	}

	angular.module('app.admin', [])
		.config(($stateProvider) => {
			$stateProvider
	      .state('admin', {
	        url: '/admin',
	        abstract: true,
	        controller: 'AdminModuleCtrl',
	        controllerAs: 'mod',
	        templateUrl: 'app/layout/_template-side-menu.html'
	      });
		})
		.controller('AdminModuleCtrl', AdminModuleCtrl);
	
})();