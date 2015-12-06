'use strict';

angular.module('app.admin')
  .config(function ($stateProvider) {
    $stateProvider
      .state('admin.product', {
        url: '/products',
        abstract: true,
        template: '<div ui-view></div>'
      })
        .state('admin.product.index', {
          url: '',
          templateUrl: 'app/admin/product/product.html',
          controller: 'ProductCtrl',
          controllerAs: 'vm'
        })
        .state('admin.product.new', {
          url: '/new',
          templateUrl: 'app/admin/product/form/product.form.html',
          controller: 'ProductFormCtrl',
          controllerAs: 'vm',
          resolve: {
            product: [ 'Product', Product => {
              return new Product({ materials: [], stock: 1 });
            }]
          }
        })
        .state('admin.product.edit', {
          url: '/:id/edit',
          templateUrl: 'app/admin/product/form/product.form.html',
          controller: 'ProductFormCtrl',
          controllerAs: 'vm',
          resolve: {
            product: [ 'Product', '$stateParams', ( Product, $stateParams ) => {
              return Product.get({ id: $stateParams.id }).$promise;
            }]
          }
        });
  });