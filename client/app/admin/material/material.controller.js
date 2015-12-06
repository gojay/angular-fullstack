'use strict';

class MaterialCtrl extends BaseTableCtrl {
	constructor($scope, $injector) {
		super($injector);
		this.resource = 'Material';
		// override count table params 
		this.tableParams.count = 5;
	}
}

MaterialCtrl.$inject = ['$scope', '$injector'];

angular.module('app.admin')
  .controller('MaterialCtrl', MaterialCtrl);
