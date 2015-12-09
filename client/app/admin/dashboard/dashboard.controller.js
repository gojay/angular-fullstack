(() => {
	'use strict';

	class DashboardCtrl {
		constructor($scope) {
			this.name = 'Welcome Admin!!';

			this.menus = [{
				title: 'Materials',
				sref: 'admin.material.index',
				icon: 'fa fa-clone fa-5x'
			},{
				title: 'Products',
				sref: 'admin.product.index',
				icon: 'fa fa-square fa-5x'
			},{
				title: 'Orders',
				sref: 'admin.order.index',
				icon: 'fa fa-shopping-bag fa-5x'
			},{
				title: 'Customers',
				sref: 'admin.customer.index',
				icon: 'fa fa-users fa-5x'
			}, {
				title: 'Services',
				sref: 'admin.service.index',
				icon: 'fa fa-wrench fa-5x'
			}];
		}
	}

	DashboardCtrl.$inject = ['$scope'];

	angular.module('app.admin')
		.controller('AdminDashboardCtrl', DashboardCtrl);
})();