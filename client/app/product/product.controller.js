'use strict';

class ProductCtrl extends BaseTableCtrl {
    constructor($scope, $injector) {
        super($injector);
        this.resource = 'Product';
    }

    openMaterial(...params) {
        return this.Modal.resource({
            templateUrl: 'app/material/show.html',
            resource: 'Material'
        })(...params);
    }
}

ProductCtrl.$inject = ['$scope', '$injector'];

angular.module('fullstackApp')
  .controller('ProductCtrl', ProductCtrl);

// angular.module('fullstackApp')
//     .controller('ProductCtrl', ProductCtrl);

// ProductCtrl.$inject = ['$scope', 'ngTableParams', 'Modal', 'Product', 'logger', 'utils'];

// function ProductCtrl($scope, ngTableParams, Modal, Product, logger, utils) {
//     var vm = this;
//     vm.products = [];

//     vm.showProduct = Modal.resource({
//         templateUrl: 'app/product/show.html',
//         resource: 'Product'
//     });

//     vm.showMaterial = Modal.resource({
//         templateUrl: 'app/material/show.html',
//         resource: 'Material',
//     });

//     vm.deleteProduct = Modal.confirm.delete(function(product) {
//         product.$remove(function() {
//             logger.success('Success!', 'Delete product');
//             vm.table.reload();
//         }, function(error) {
//             logger.error('Error occured!', 'Delete product', err);
//         });
//     });

//     /* table params */

//     var params = {
//         count: 10,
//         sorting: {
//             created: 'desc'
//         }
//     };
//     vm.table = new ngTableParams(params, {
//         total: 0,
//         getData: getData,
//     });

//     function getData($defer, params) {
//         vm.loading = true;
//         var query = utils.patchListParams(params);
//         Product.query(query, function(products, headers) {
//             $defer.resolve(products);
//             vm.table.total(headers('X-Pagination-Total-Count'));
//             vm.loading = true;
//         }, function(err) {
//             logger.error('Error occured!', 'Load products', err);
//             vm.loading = true;
//         });
//     }

// }
