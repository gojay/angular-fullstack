'use strict';

class ProductFormCtrl extends BaseFormCtrl {
	constructor($scope, product, Material, ...parentDependencies) {
		// '$state', 'logger'
		super(...parentDependencies);

		this.$scope = $scope;
		this.name = 'Product';
		this.model = product;
		this.Material = Material;

		this._resetField();

		var unwatch = this.$scope.$watch(() => this.selectedField, this._watchSelectedField(), true);
		this.$scope.$on('$destroy', () => { 
			unwatch();
		});
	}

	_watchSelectedField() {
		return (newValue, oldValue) => {
			console.log('selectedField', newValue, oldValue);
		}
	}

	_resetField() {
		this.selectedField = {
      _material: null,
      qty: 1
    };
    this.isAddingField = this.fieldKeyError = this.fieldValueError = false;
	}

	addField() {
    this.isAddingField = true;
    if (!this.selectedField._material) {
      this.fieldKeyError = true;
      return;
    }
    if (!this.selectedField.qty) {
      this.fieldValueError = true;
      return;
    }

    var indexExist = _.findIndex(this.model.materials, (m) => {
    	return m._material._id == this.selectedField._material._id;
    });
    if (indexExist > -1) {
    	this.model.materials[indexExist].qty += this.selectedField.qty;
    } else {
      this.model.materials.push({
        _material: this.selectedField._material,
        qty: this.selectedField.qty
      });
    }

		this._resetField();
	}

	removeField(index) {
  	this.model.materials.splice(index, 1);
	}

	selectMaterial(material) {
		this.Material.search({ q: material }, (materials) =>{
			this.materials = materials;
		});
	}

	// @override
	_beforeSave(form) {
		console.log('override -> _beforeSave', form, this.model);
  	form.materials.$setValidity('required', !_.isEmpty(this.model.materials));
	}
}

ProductFormCtrl.$inject = ['$scope', 'product', 'Material', '$state', 'logger'];

angular.module('fullstackApp')
	.controller('ProductFormCtrl', ProductFormCtrl);

/*ProductFormCtrl.$inject = ['$scope', '$state', '$timeout', 'logger', 'product', 'Material'];
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
};*/
