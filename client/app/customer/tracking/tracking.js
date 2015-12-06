(() => {
	'use strict';

	angular.module('app.customer')
		.config(($stateProvider) => {
    	$stateProvider
	      .state('customer.tracking', {
	        url: '/tracking',
	        templateUrl: 'app/customer/tracking/tracking.html',
	        controller: 'CustomerTrackingCtrl',
	        controllerAs: 'vm'
	      });
  	});
})();