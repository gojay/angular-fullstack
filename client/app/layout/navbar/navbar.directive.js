'use strict';

let navbarDirective = () => {
	return {
		restrict: 'E',
    scope: {},
  	templateUrl: 'app/layout/navbar/navbar.html',
    replace: true,
    controller: NavbarCtrl,
    controllerAs: 'vm',
    bindToController: true
	}
}

angular.module('app.layout')
  .directive('navbar', navbarDirective);
