(() => {
	'use strict';

	angular.module('app.core', [
		'ngCookies',
	  'ngResource',
	  'ngSanitize',
	  'ngMessages',
	  'ui.router',
	  'ui.bootstrap',
	  'ui.select',
	  'ui.utils', 
	  'ui.utils.masks',
	  'btford.socket-io',
	  'validation.match',
	  'toastr',
	  'angularMoment',
	  'ngTable'
	]);
	
})()