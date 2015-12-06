'use strict';

class NavbarCtrl {
  constructor(Auth) {
    this.menu = [{
      'title': 'Home',
      'state': 'home'
    },{
      'title': 'My Account',
      'state': 'customer.dashboard'
    },{
      'title': 'Admin',
      'state': 'admin.dashboard'
    }/*,{
      'title': 'Products',
      'state': 'admin.product.index'
    },{
      'title': 'Orders',
      'state': 'admin.order.index'
    },{
      'title': 'Customers',
      'state': 'admin.customer.index'
    }*/];

    this.isCollapsed = true;
    this.isLoggedIn = Auth.isLoggedIn;
    this.isAdmin = Auth.isAdmin;
    this.getCurrentUser = Auth.getCurrentUser;
  }
}

NavbarCtrl.$inject = ['Auth'];
