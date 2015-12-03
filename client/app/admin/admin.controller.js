'use strict';

class AdminCtrl {
	constructor($log, $http, Auth, User) {
		this.$log = $log;
		this.$http = $http;
		this.Auth = Auth;
		this.User = User;

		this.users = this.User.query();
	}

	delete(user, $index) {
		this.User.remove({ id: user._id });
      	this.users.splice($index, 1);
	}
}

AdminCtrl.$inject = ['$log', '$http', 'Auth', 'User'];

angular.module('fullstackApp')
  .controller('AdminCtrl', AdminCtrl);

/*angular.module('fullstackApp')
  .controller('AdminCtrl', function($scope, $http, Auth, User) {

    // Use the User $resource to fetch all users
    $scope.users = User.query();

    $scope.delete = function(user) {
      User.remove({ id: user._id });
      $scope.users.splice(this.$index, 1);
    };
  });*/
