'use strict';

angular.module('fullstackApp')
  .config(($stateProvider) => {
    $stateProvider
      .state('main', {
        url: '/',
        templateUrl: 'app/main/main.html',
        controller: 'MainController',
        controllerAs: 'vm'
      });
  });
