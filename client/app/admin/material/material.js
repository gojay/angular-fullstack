'use strict';

angular.module('app.admin')
  .config(function ($stateProvider) {
    $stateProvider
      .state('admin.material', {
        url: '/materials',
        abstract: true,
        template: '<div ui-view></div>'
      })
        .state('admin.material.index', {
          url: '',
          templateUrl: 'app/admin/material/material.html',
          controller: 'MaterialCtrl',
          controllerAs: 'vm'
        })
        .state('admin.material.new', {
          url: '/new',
          templateUrl: 'app/admin/material/form/material.form.html',
          controller: 'MaterialFormCtrl',
          controllerAs: 'vm',
          resolve: {
        		material: [ 'Material', Material => {
      				return new Material;
      			}]
        	}
        })
        .state('admin.material.edit', {
          url: '/:id/edit',
          templateUrl: 'app/admin/material/form/material.form.html',
          controller: 'MaterialFormCtrl',
          controllerAs: 'vm',
          resolve: {
            material: [ 'Material', '$stateParams', ( Material, $stateParams ) => {
            	return Material.get({ id: $stateParams.id }).$promise;
          	}]
        	}
        });
  });
