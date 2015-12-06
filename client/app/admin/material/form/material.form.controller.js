'use strict';

class MaterialFormCtrl extends BaseFormCtrl {
	constructor(material, ...parentDependencies) {
		super(...parentDependencies);
		this.name = 'Material';
		this.model = material;
	}
}

MaterialFormCtrl.$inject = ['material', '$state', 'logger'];

angular.module('app.admin')
	.controller('MaterialFormCtrl', MaterialFormCtrl);
