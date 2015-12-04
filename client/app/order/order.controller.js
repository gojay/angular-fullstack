'use strict';

class OrderCtrl extends BaseTableCtrl {
    constructor($scope, $injector) {
        super($injector);
        this.resource = 'Order';
    }

    openCustomer(...params) {
        return this.Modal.resource({
            templateUrl: 'app/customer/show.html',
            resource: 'Customer'
        })(...params);
    }
}

OrderCtrl.$inject = ['$scope', '$injector'];

angular.module('fullstackApp')
    .controller('OrderCtrl', OrderCtrl);
