'use strict';

angular.module('app.guest')
  .config(($stateProvider) => {
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'app/guest/home/home.html',
        controller: 'HomeCtrl',
        controllerAs: 'vm'
      });
  });
