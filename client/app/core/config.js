(() => {
	'use strict';

	angular.module('app.core')
		.constant('CONFIG', {
			service: {
				modes: [
					{ id: 0, title: 'Columns' },
					{ id: 1, title: 'Tabs' },
					{ id: 2, title: 'Modal' }
				]
			}
		})
		.config(($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) => {
	    $urlRouterProvider
	      .otherwise('/');

	    $locationProvider.html5Mode(true);
	    $httpProvider.interceptors.push('authInterceptor');
	  })
	  .factory('authInterceptor', ($rootScope, $q, $cookies, $injector) => {
	    var state;
	    return {
	      // Add authorization token to headers
	      request: (config) => {
	        config.headers = config.headers || {};
	        if ($cookies.get('token')) {
	          config.headers.Authorization = 'Bearer ' + $cookies.get('token');
	        }
	        return config;
	      },

	      // Intercept 401s and redirect you to login
	      responseError: (response) => {
	        if (response.status === 401) {
	          (state || (state = $injector.get('$state'))).go('login');
	          // remove any stale tokens
	          $cookies.remove('token');
	          return $q.reject(response);
	        }
	        else {
	          return $q.reject(response);
	        }
	      }
	    };
	  });
})()