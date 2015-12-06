(() => {
	'use strict';

	class HistoryCtrl {
		constructor($scope) {
			this.name = 'History Customer';
			console.log('HistoryCtrl');
		}
	}

	HistoryCtrl.$inject = ['$scope'];

	angular.module('app.customer')
		.controller('CustomerHistoryCtrl', HistoryCtrl);
})();