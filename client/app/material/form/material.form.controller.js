'use strict';

angular.module('fullstackApp')
	.controller('MaterialFormCtrl', MaterialFormCtrl);

MaterialFormCtrl.$inject = ['$scope', '$state', '$timeout', 'logger', 'material'];

function MaterialFormCtrl ($scope, $state, $timeout, logger, material) {
	var vm = this;
	vm.material = material;

	/* validation */

	vm.submitted = false;

	vm.formClass = function(field) {
		if(field.$dirty || vm.submitted) return field.$valid ? 'has-success' : 'has-error' ;
		return null;
	};

	vm.interacted = function(field) {
  	return vm.submitted || field.$dirty;
	};

	/* save */

	vm.save = function(materialForm){
		vm.submitted = true;
		if( materialForm.$valid ) {
			vm.loading = true;
			vm.material.$save().then(function success(data) {
				vm.loading = vm.submitted = false;
				$state.go('^.index');
				logger.success('Saved successfuly', 'Material');
			}, function error(data) {
				logger.error('Fail added material!', 'Material');
			});
		} 
	}
};
