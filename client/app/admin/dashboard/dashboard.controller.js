(() => {
	'use strict';

	class DashboardCtrl {
		constructor($scope) {
			this.name = 'Welcome Admin!!';

			this.menus = [{
				title: 'Material',
				sref: 'admin.material.index',
				icon: 'fa fa-clone fa-5x'
			},{
				title: 'Product',
				sref: 'admin.product.index',
				icon: 'fa fa-square fa-5x'
			},{
				title: 'Order',
				sref: 'admin.order.index',
				icon: 'fa fa-shopping-bag fa-5x'
			},{
				title: 'Customer',
				sref: 'admin.customer.index',
				icon: 'fa fa-users fa-5x'
			}];
		}
	}

	DashboardCtrl.$inject = ['$scope'];

	angular.module('app.admin')
		.controller('AdminDashboardCtrl', DashboardCtrl);
})();