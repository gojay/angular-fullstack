'use strict';

angular.module('fullstackApp')
  .config(($stateProvider) => {
    $stateProvider
      .state('order', {
        url: '/orders',
        abstract: true,
        template: '<navbar></navbar><div ui-view></div>'
      })
      .state('order.index', {
        url: '',
        templateUrl: 'app/order/order.html',
        controller: 'OrderCtrl as vm'
      })
        .state('order.new', {
          url: '/new',
          templateUrl: 'app/order/form/order.form.html',
          controller: 'OrderFormCtrl as vm',
        	resolve: {
        		order: [ 'Order', Order => {
      				return new Order({ _customer: {}, _items: [] });
      			}]
        	}
        })
        .state('order.edit', {
            url: '/:id/edit',
            templateUrl: 'app/order/form/order.form.html',
            controller: 'OrderFormCtrl as vm',
          	resolve: {
              order: [ 'Order', '$stateParams', (Order, $stateParams) => {
              	return Order.get({ id: $stateParams.id }).$promise;
            	}]
          	}
        });
  });