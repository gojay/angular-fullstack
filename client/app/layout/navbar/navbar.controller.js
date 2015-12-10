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
      'title': 'Admin',
      'state': 'admin.dashboard'
    },{
      'title': 'My Account',
      'state': 'customer.dashboard'
    }];

    this.isCollapsed = true;
    this.isLoggedIn = Auth.isLoggedIn;
    this.isAdmin = Auth.isAdmin;
    this.getCurrentUser = Auth.getCurrentUser;
  }
}

NavbarCtrl.$inject = ['Auth'];
