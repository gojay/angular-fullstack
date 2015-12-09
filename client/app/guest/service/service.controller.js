(() => {
	'use strict';

	class ServiceCtrl {
		constructor($scope, OurService) {
			this.name = 'Our Service';
		}
	}

	ServiceCtrl.$inject = ['$scope', 'OurService'];

	angular.module('app.guest')
	  .controller('ServiceCtrl', ServiceCtrl);

})();
