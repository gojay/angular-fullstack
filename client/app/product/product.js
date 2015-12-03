'use strict';

angular.module('fullstackApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('product', {
        url: '/products',
        abstract: true,
        template: '<navbar></navbar><div ui-view></div>'
      })
        .state('product.index', {
          url: '',
          templateUrl: 'app/product/product.html',
          controller: 'ProductCtrl as vm'
        })
        .state('product.new', {
          url: '/new',
          templateUrl: 'app/product/form/product.form.html',
          controller: 'ProductFormCtrl as vm',
          resolve: {
            product: [
              'Product',
              function ( Product ) {
                return new Product;
              }
            ]
          }
        })
        .state('product.edit', {
          url: '/:id/edit',
          templateUrl: 'app/product/form/product.form.html',
          controller: 'ProductFormCtrl as vm',
          resolve: {
            product: [
                'Product',
                '$stateParams',
                function ( Product, $stateParams ) {
                  return Product.get({ id: $stateParams.id }).$promise;
                }
            ]
          }
        });
  });