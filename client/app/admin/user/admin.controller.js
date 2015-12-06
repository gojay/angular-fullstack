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

angular.module('app.admin')
  .controller('AdminCtrl', AdminCtrl);
