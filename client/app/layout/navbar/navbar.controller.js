'use strict';

class NavbarCtrl {
  constructor(Auth) {
    this.menu = [{
      'title': 'Home',
      'state': 'home'
    },{
      'title': 'Book Appointment',
      'state': 'book.service'
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
