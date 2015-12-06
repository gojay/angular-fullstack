'use strict';

angular.module('app.admin')
  .config(($stateProvider) => {
    $stateProvider
      .state('admin.order', {
        url: '/orders',
        abstract: true,
        template: '<div ui-view></div>'
      })
        .state('admin.order.index', {
          url: '',
          templateUrl: 'app/admin/order/order.html',
          controller: 'OrderCtrl',
          controllerAs: 'vm'
        })
        .state('admin.order.new', {
          url: '/new',
          templateUrl: 'app/admin/order/form/order.form.html',
          controller: 'OrderFormCtrl',
          controllerAs: 'vm',
        	resolve: {
        		order: [ 'Order', Order => {
      				return new Order({ _customer: {}, _items: [] });
      			}]
        	}
        })
        .state('admin.order.edit', {
          url: '/:id/edit',
          templateUrl: 'app/admin/order/form/order.form.html',
          controller: 'OrderFormCtrl',
          controllerAs: 'vm',
        	resolve: {
            order: [ 'Order', '$stateParams', (Order, $stateParams) => {
            	return Order.get({ id: $stateParams.id }).$promise;
          	}]
        	}
        });
  });