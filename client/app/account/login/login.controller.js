'use strict';

class LoginCtrl {
  constructor($log, $state, Auth) {
    this.$log = $log;
    this.$state = $state;
    this.Auth = Auth;

    this.user = {};
    this.errors = {};
  }

  login(form) {
    this.submitted = true;

    if (form.$valid) {
      this.Auth.login({
        email: this.user.email,
        password: this.user.password
      })
      .then((response) => {
        this.$log.info('login', response);
        // Logged in, redirect to home
        this.$state.go('main');
      })
      .catch((error) => {
        this.$log.error('login', error);
        this.errors.other = err.message;
      });
    }
  }
}

LoginCtrl.$inject = ['$log', '$state', 'Auth'];

angular.module('fullstackApp')
  .controller('LoginCtrl', LoginCtrl);

/*angular.module('fullstackApp')
  .controller('LoginCtrl', function($scope, Auth, $state) {
    $scope.user = {};
    $scope.errors = {};

    $scope.login = function(form) {
      $scope.submitted = true;

      if (form.$valid) {
        Auth.login({
          email: $scope.user.email,
          password: $scope.user.password
        })
        .then(function() {
          // Logged in, redirect to home
          $state.go('main');
        })
        .catch(function(err) {
          $scope.errors.other = err.message;
        });
      }
    };

  });*/
