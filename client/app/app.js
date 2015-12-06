(() => {
  'use strict';

  angular.module('fullstackApp', [
    'app.core',
    'app.components',
    'app.layout',

    'app.guest',
    'app.customer',
    'app.admin'
  ])
  .run(($rootScope, $state, Auth) => {
    // Redirect to login if route requires auth and the user is not logged in
    $rootScope.$on('$stateChangeStart', (event, next) => {
      if (next.authenticate) {
        Auth.isLoggedIn((loggedIn) => {
          if (!loggedIn) {
            event.preventDefault();
            $state.go('login');
          }
        });
      }
    });
  });
})();
