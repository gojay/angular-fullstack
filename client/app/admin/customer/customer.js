'use strict';

angular.module('app.admin')
  .config(($stateProvider) => {
    $stateProvider
      .state('admin.customer', {
        url: '/customers',
        abstract: true,
        template: '<div ui-view></div>'
      })
        .state('admin.customer.index', {
          url: '',
          templateUrl: 'app/admin/customer/customer.html',
          controller: 'CustomerCtrl',
          controllerAs: 'vm'
        })
        .state('admin.customer.new', {
          url: '/new',
          templateUrl: 'app/admin/customer/form/customer.form.html',
          controller: 'CustomerFormCtrl',
          controllerAs: 'vm',
        	resolve: {
        		customer: [ 'Customer', Customer => {
      				return new Customer;
      			}]
        	}
        })
        .state('admin.customer.edit', {
          url: '/:id/edit',
          templateUrl: 'app/admin/customer/form/customer.form.html',
          controller: 'CustomerFormCtrl',
          controllerAs: 'vm',
        	resolve: {
            customer: [ 'Customer', '$stateParams', (Customer, $stateParams) => {
            	return Customer.get({ id: $stateParams.id }).$promise;
          	}]
        	}
        });
  });