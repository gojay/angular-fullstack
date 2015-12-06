(() => {
	'use strict';

	angular.module('app.customer')
		.config(($stateProvider) => {
    	$stateProvider
	      .state('customer.history', {
	        url: '/history',
	        templateUrl: 'app/customer/history/history.html',
	        controller: 'CustomerHistoryCtrl',
	        controllerAs: 'vm'
	      });
  	});
})();