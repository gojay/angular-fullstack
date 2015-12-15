'use strict';

angular.module('app.guest')
  .config(function ($stateProvider) {
    $stateProvider
      .state('service', {
        url: '/service',
        templateUrl: 'app/guest/service/service.html',
        controller: 'ServiceCtrl',
        controllerAs: 'vm'
      })
	      .state('service.appointment', {
	        url: '/appointment',
        	templateUrl: 'app/guest/service/templates/appointment.html'
	      })
		      .state('service.appointment.step1', {
		        url: '/step1',
		        templateUrl: 'app/guest/service/templates/step1-area.html',
		      })
		      .state('service.appointment.step2', {
		        url: '/step2',
		        templateUrl: 'app/guest/service/templates/step2-contact-location.html',
		      })
		      .state('service.appointment.step3', {
		        url: '/step3',
		        templateUrl: 'app/guest/service/templates/step3-schedule.html',
		      });
  });
