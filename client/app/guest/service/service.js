'use strict';

angular.module('app.guest')
  .config(function ($stateProvider) {
    $stateProvider
      .state('service', {
        url: '/service',
        templateUrl: 'app/guest/service/service.html',
        controller: 'ServiceCtrl',
        controllerAs: 'vm'
      });
  });
