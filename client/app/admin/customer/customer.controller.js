'use strict';

class CustomerCtrl extends BaseTableCtrl {
    constructor($scope, $injector) {
        super($injector);
        this.resource = 'Customer';
    }
}

CustomerCtrl.$inject = ['$scope', '$injector'];

angular.module('app.admin')
  .controller('CustomerCtrl', CustomerCtrl);
