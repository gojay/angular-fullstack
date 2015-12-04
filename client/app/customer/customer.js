'use strict';

angular.module('fullstackApp')
  .config(($stateProvider) => {
    $stateProvider
      .state('customer', {
        url: '/customer',
        abstract: true,
        template: '<navbar></navbar><div ui-view></div>'
      })
        .state('customer.index', {
          url: '',
          templateUrl: 'app/customer/customer.html',
          controller: 'CustomerCtrl as vm'
        })
        .state('customer.new', {
          url: '/new',
          templateUrl: 'app/customer/form/customer.form.html',
          controller: 'CustomerFormCtrl as vm',
        	resolve: {
        		customer: [ 'Customer', Customer => {
      				return new Customer;
      			}]
        	}
        })
        .state('customer.edit', {
          url: '/:id/edit',
          templateUrl: 'app/customer/form/customer.form.html',
          controller: 'CustomerFormCtrl as vm',
        	resolve: {
            customer: [ 'Customer', '$stateParams', (Customer, $stateParams) => {
            	return Customer.get({ id: $stateParams.id }).$promise;
          	}]
        	}
        });
  });