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

		/** example scope $watch/listener
		var unwatch = this.$scope.$watch(() => this.selectedField, this._watchSelectedField(), true);
		this.$scope.$on('$destroy', () => { 
			unwatch();
		});
		*/
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
  		form.materials.$setValidity('required', !_.isEmpty(this.model.materials));
		console.log('override -> _beforeSave : check validity materials', form.materials);
	}
}

ProductFormCtrl.$inject = ['$scope', 'product', 'Material', '$state', 'logger'];

angular.module('app.admin')
	.controller('ProductFormCtrl', ProductFormCtrl);
