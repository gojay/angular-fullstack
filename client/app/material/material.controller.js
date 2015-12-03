'use strict';

class MaterialCtrl extends BaseTableCtrl {
	constructor(...parentDependecies) {
		// $state, resource, ngTableParams, Modal, logger, utils
		super(...parentDependecies);
		// override count table params 
		this.params.count = 5;
	}
}

MaterialCtrl.$inject = ['$state', 'Material', 'ngTableParams', 'Modal', 'logger', 'utils'];

angular.module('fullstackApp')
  .controller('MaterialCtrl', MaterialCtrl);
