'use strict';

class NavbarCtrl {
  constructor(Auth) {
    this.menu = [{
      'title': 'Home',
      'state': 'home'
    },{
      'title': 'Services',
      'state': 'service'
    },{
      'title': 'My Account',
      'state': 'customer.dashboard'
    },{
      'title': 'Admin',
      'state': 'admin.dashboard'
    }];

    this.isCollapsed = true;
    this.isLoggedIn = Auth.isLoggedIn;
    this.isAdmin = Auth.isAdmin;
    this.getCurrentUser = Auth.getCurrentUser;
  }
}

NavbarCtrl.$inject = ['Auth'];
