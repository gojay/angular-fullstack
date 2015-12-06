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

angular.module('app.admin')
  .controller('ProductCtrl', ProductCtrl);
