(() => {
	'use strict';

	class TrackingCtrl {
		constructor($scope) {
			this.name = 'Tracking Customer';
			console.log('TrackingCtrl');
		}
	}

	TrackingCtrl.$inject = ['$scope'];

	angular.module('app.customer')
		.controller('CustomerTrackingCtrl', TrackingCtrl);
})();