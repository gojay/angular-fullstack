'use strict';

angular.module('app.guest')
  .config(function ($stateProvider) {
    $stateProvider
      .state('book', {
        url: '/booking',
        abstract: true,
        templateUrl: 'app/guest/service/service.html',
        controller: 'ServiceCtrl',
        controllerAs: 'vm'
      })
	      .state('book.service', {
	        url: '/service',
        	templateUrl: 'app/guest/service/templates/service.html'
	      })
	      .state('book.appointment', {
	        url: '/appointment',
        	abstract: true,
        	templateUrl: 'app/guest/service/templates/appointment.html'
	      })
		      .state('book.appointment.step1', {
		        url: '/step1',
		        templateUrl: 'app/guest/service/templates/appointment-step1_area.html',
		      })
		      .state('book.appointment.step2', {
		        url: '/step2',
		        templateUrl: 'app/guest/service/templates/appointment-step2_contact_location.html',
		      })
		      .state('book.appointment.step3', {
		        url: '/step3',
		        templateUrl: 'app/guest/service/templates/appointment-step3_schedule.html',
		      });
  });
