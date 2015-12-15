(() => {
	'use strict';

	angular.module('app.core')
		.constant('CONFIG', {
			service: {
				modes: [
					{ id: 0, title: 'Columns' },
					{ id: 1, title: 'Tabs' },
					{ id: 2, title: 'Modal' }
				],
				times: [{ h: 10, title: '10AM' }, { h: 14, title: '2AM' }, { h: 17, title: '5AM' }],
				region: [{ name: 'Selong', zipcode: "12110" },{ name: 'Gunung', zipcode: "12120" },{ name: 'Kramat Pela', zipcode: "12130" },{ name: 'Gandaria Utara', zipcode: "12140" },{ name: 'Cipete Utara', zipcode: "12150" },{ name: 'Pulo', zipcode: "12160" },{ name: 'Melawai', zipcode: "12160" },{ name: 'Petogogan', zipcode: "12170" },{ name: 'Rawa Barat', zipcode: "12180" },{ name: 'Senayan', zipcode: "12190" }]
			},
			cities: ['Aceh', 'Bali', 'Banten', 'Bengkulu', 'Gorontalo' , 'Jakarta' , 'Jambi', 'Jawa Barat', 'Jawa Tengah' ,
              'Jawa Timur', 'Kalimantan Barat' , 'Kalimantan Selatan' , 'Kalimantan Tengah' , 'Kalimantan Tengah', 'Kalimantan Timur' ,
              'Kalimantan Utara','Kepulauan Bangka', 'Kepulauan Riau' , 'Lampung', 'Maluku', 'Maluku Utara', 'Nusa Tenggara Barat', 'Nusa Tenggara Timur',
              'Papua', 'Papua Barat', 'Riau', 'Sulawesi Barat', 'Sulawesi Selatan', 'Sulawesi Tengah', 'Sulawesi Tenggara', 'Sulawesi Utara',
              'Sumatera Selatan', 'Sumatera Barat', 'Sumatera Utara', 'Yogyakarta'  ]
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