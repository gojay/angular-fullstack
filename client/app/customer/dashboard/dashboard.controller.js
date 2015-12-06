(() => {
	'use strict';

	class DashboardCtrl {
		constructor($scope) {
			this.name = 'Dashboard Customer';
			console.log('DashboardCtrl');
		}
	}

	DashboardCtrl.$inject = ['$scope'];

	angular.module('app.customer')
		.controller('CustomerDashboardCtrl', DashboardCtrl);
})();