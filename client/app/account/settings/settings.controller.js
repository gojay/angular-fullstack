'use strict';

class SettingsCtrl {
  constructor($log, User, Auth) {
    this.$log = $log;
    this.User = User;
    this.Auth = Auth;

    this.user = {};
  }

  changePassword(form) {
    this.submitted = true;
    if (form.$valid) {
      Auth.changePassword(this.user.oldPassword, this.user.newPassword)
        .then((response) => {
          this.$log.info('changePassword', response);
          this.message = 'Password successfully changed.';
        })
        .catch((error) => {
          this.$log.error('changePassword', error);
          form.password.$setValidity('mongoose', false);
          this.errors.other = 'Incorrect password';
          this.message = '';
        });
    }
  }
}

SettingsCtrl.$inject = ['$log', 'User', 'Auth'];

angular.module('fullstackApp')
  .controller('SettingsCtrl', SettingsCtrl);

/*angular.module('fullstackApp')
  .controller('SettingsCtrl', function($scope, User, Auth) {
    $scope.errors = {};

    $scope.changePassword = function(form) {
      $scope.submitted = true;
      if (form.$valid) {
        Auth.changePassword($scope.user.oldPassword, $scope.user.newPassword)
          .then(function() {
            $scope.message = 'Password successfully changed.';
          })
          .catch(function() {
            form.password.$setValidity('mongoose', false);
            $scope.errors.other = 'Incorrect password';
            $scope.message = '';
          });
      }
    };
  });*/
