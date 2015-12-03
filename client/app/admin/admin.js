'use strict';

angular.module('fullstackApp')
  .config(($stateProvider) => {
    $stateProvider
      .state('admin', {
        url: '/admin',
        templateUrl: 'app/admin/admin.html',
        controller: 'AdminCtrl',
        controllerAs: 'vm'
      });
  });
