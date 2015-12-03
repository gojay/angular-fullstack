'use strict';

let navbarDirective = () => {
	return {
		restrict: 'E',
    scope: {},
  	templateUrl: 'components/navbar/navbar.html',
    controller: NavbarCtrl,
    controllerAs: 'vm',
    bindToController: true
	}
}

angular.module('fullstackApp')
  .directive('navbar', navbarDirective);

/*angular.module('fullstackApp')
  .directive('navbar', function () {
    return {
      templateUrl: 'components/navbar/navbar.html',
      restrict: 'E',
      controller: 'NavbarCtrl'
    };
  });*/
