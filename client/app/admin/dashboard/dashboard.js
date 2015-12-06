(() => {
	'use strict';

	angular.module('app.admin')
		.config(function ($stateProvider) {
    	$stateProvider
	      .state('admin.dashboard', {
	        url: '/dashboard',
	        templateUrl: 'app/admin/dashboard/dashboard.html',
	        controller: 'AdminDashboardCtrl',
	        controllerAs: 'vm'
	      });
  	});
})();