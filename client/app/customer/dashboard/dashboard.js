(() => {
	'use strict';

	angular.module('app.customer')
		.config(($stateProvider) => {
    	$stateProvider
	      .state('customer.dashboard', {
	        url: '/dashboard',
	        templateUrl: 'app/customer/dashboard/dashboard.html',
	        controller: 'CustomerDashboardCtrl',
	        controllerAs: 'vm'
	      });
  	});
})();