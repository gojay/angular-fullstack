'use strict';

angular.module('fullstackApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('material', {
        url: '/materials',
        abstract: true,
        template: '<navbar></navbar><div ui-view></div>'
      })
	      .state('material.index', {
	        url: '',
	        templateUrl: 'app/material/material.html',
	        controller: 'MaterialCtrl',
	        controllerAs: 'vm'
	      })
	      .state('material.new', {
	        url: '/new',
	        templateUrl: 'app/material/material.form.html',
	        controller: 'MaterialFormCtrl',
	        controllerAs: 'vm',
	        resolve: {
        		material: [
        			'Material',
        			function ( Material ) {
        				return new Material;
        			}
        		]
        	}
	      })
	      .state('material.edit', {
	        url: '/:id/edit',
	        templateUrl: 'app/material/material.form.html',
	        controller: 'MaterialFormCtrl',
	        controllerAs: 'vm',
	        resolve: {
            material: [
              	'Material',
              	'$stateParams',
              	function ( Material, $stateParams ) {
                	return Material.get({ id: $stateParams.id }).$promise;
              	}
            ]
        	}
	      });
  });
