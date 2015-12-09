'use strict';

angular.module('app.admin')
  .config(function ($stateProvider) {
    $stateProvider
      .state('admin.service', {
        url: '/services',
        abstract: true,
        template: '<div ui-view></div>'
      })
	      .state('admin.service.index', {
	        url: '/',
	        templateUrl: 'app/admin/service/service.html',
	        controller: 'AdminServiceCtrl',
	        controllerAs: 'vm'
	      });
  });
