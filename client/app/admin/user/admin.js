'use strict';

angular.module('fullstackApp')
  .config(($stateProvider) => {
    $stateProvider
      .state('admin.user', {
        url: '/users',
        templateUrl: 'app/admin/user/user.html',
        controller: 'AdminCtrl',
        controllerAs: 'vm'
      });
  });
