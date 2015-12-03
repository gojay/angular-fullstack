'use strict';

angular.module('fullstackApp')
	.controller('ProductFormCtrl', ProductFormCtrl);

ProductFormCtrl.$inject = ['$scope', '$state', '$timeout', 'logger', 'product', 'Material'];

function ProductFormCtrl ($scope, $state, $timeout, logger, product, Material) {
	var vm = this;
	vm.submitted = false;

	if(!product.materials) product.materials = [];
	vm.product = product;

	vm.selectedField = {
		_material: null,
		qty: 1
  	};
	vm.removeField = removeField;
	vm.addField = addField;
	vm.selectMaterial = selectMaterial;

	vm.formClass = formClass;
	vm.interacted = interacted;
	vm.save = save;

	function removeField(index) {
    	vm.product.materials.splice(index, 1);
  	};

  	function addField() {
	    vm.isAddingField = true;
	    if (!vm.selectedField._material) {
	        vm.fieldKeyError = true;
	        return;
	    }
	    if (!vm.selectedField.qty) {
	        vm.fieldValueError = true;
	        return;
	    }

	    var indexExist = _.findIndex(vm.product.materials, function (m) {
	    	return m._material._id == vm.selectedField._material._id;
	    });
	    if (indexExist > -1) {
	    	vm.product.materials[indexExist].qty += vm.selectedField.qty;
	    } else {
	        vm.product.materials.push({
	            _material: vm.selectedField._material,
	            qty: vm.selectedField.qty
	        });
	    }

	    vm.selectedField = {
	        _material: null,
	        qty: 1
	    };
	    vm.isAddingField = vm.fieldKeyError = vm.fieldValueError = false;
	};

	function selectMaterial(material) {
		var params = { q: material };
		Material.search(params, function (materials) {
			vm.materials = materials;
		});
	}

	function formClass(field) {
		if(field && field.$dirty || vm.submitted) return field.$valid ? 'has-success' : 'has-error' ;
		return null;
	};

	function interacted(field) {
  		return vm.submitted || (field && field.$dirty);
	};

	function save(productForm){
		vm.submitted = true;
		var isValid = vm.product.materials.length > 0;
    	productForm.materials.$setValidity('required', isValid);
		if( productForm.$valid ) {
			vm.loading = true;
			vm.product.$save().then(function success(data) {
				vm.loading = vm.submitted = false;
				$state.go('^.index');
				logger.success('Saved successfuly', 'Product');
			}, function error(data) {
				logger.error('Fail added product!', 'Product');
			});
		} 
	}
};
