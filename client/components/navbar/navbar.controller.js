'use strict';

class NavbarCtrl {
  constructor(Auth) {
    this.menu = [{
      'title': 'Home',
      'state': 'main'
    },{
      'title': 'Materials',
      'state': 'material.index'
    },{
      'title': 'Products',
      'state': 'product.index'
    },{
      'title': 'Orders',
      'state': 'order.index'
    },{
      'title': 'Customers',
      'state': 'customer.index'
    }];

    this.isCollapsed = true;
    this.isLoggedIn = Auth.isLoggedIn;
    this.isAdmin = Auth.isAdmin;
    this.getCurrentUser = Auth.getCurrentUser;
  }
}

NavbarCtrl.$inject = ['Auth'];

/*
angular.module('fullstackApp')
  .controller('NavbarCtrl', function ($scope, Auth) {
    $scope.menu = [{
      'title': 'Home',
      'state': 'main'
    }];

    $scope.isCollapsed = true;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $scope.getCurrentUser = Auth.getCurrentUser;
  });
*/
