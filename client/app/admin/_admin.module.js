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
			},{
				title: 'Services',
				sref: 'admin.service.index',
				icon: 'fa fa-wrench fa-5x'
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