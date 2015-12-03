'use strict';

class SignupCtrl {
  constructor($state, $log, Auth) {
    this.$state = $state;
    this.$log = $log;
    this.Auth = Auth;

    this.user = {};
    this.errors = {};
  }

  register(form) {
    this.submitted = true;

    if (form.$valid) {
      this.Auth.createUser({
        name: this.user.name,
        email: this.user.email,
        password: this.user.password
      })
      .then((response) => {
        this.$log.info('register:success', response);
        // Account created, redirect to home
        this.$state.go('main');
      })
      .catch((err) => {
        this.$log.error('register:error', error);

        err = err.data;
        this.errors = {};

        // Update validity of form fields that match the mongoose errors
        angular.forEach(err.errors, (error, field) => {
          form[field].$setValidity('mongoose', false);
          this.errors[field] = error.message;
        });
      });
    }
  }
}

SignupCtrl.$inject = ['$state', '$log', 'Auth'];

angular.module('fullstackApp')
  .controller('SignupCtrl', SignupCtrl);

/*angular.module('fullstackApp')
  .controller('SignupCtrl', function($scope, Auth, $state) {
    $scope.user = {};
    $scope.errors = {};

    $scope.register = function(form) {
      $scope.submitted = true;

      if (form.$valid) {
        Auth.createUser({
          name: $scope.user.name,
          email: $scope.user.email,
          password: $scope.user.password
        })
        .then(function() {
          // Account created, redirect to home
          $state.go('main');
        })
        .catch(function(err) {
          err = err.data;
          $scope.errors = {};

          // Update validity of form fields that match the mongoose errors
          angular.forEach(err.errors, function(error, field) {
            form[field].$setValidity('mongoose', false);
            $scope.errors[field] = error.message;
          });
        });
      }
    };
  });*/
