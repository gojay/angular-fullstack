'use strict';

angular.module('fullstackApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngMessages',
  'ui.router',
  'ui.bootstrap',
  'ui.select',
  'ui.utils', 
  'ui.utils.masks',
  'btford.socket-io',
  'validation.match',
  'toastr',
  'angularMoment',
  'ngTable'
])
  .config(($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) => {
    $urlRouterProvider
      .otherwise('/');

    $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('authInterceptor');
  })

  .factory('authInterceptor', ($rootScope, $q, $cookies, $injector) => {
    var state;
    return {
      // Add authorization token to headers
      request: (config) => {
        config.headers = config.headers || {};
        if ($cookies.get('token')) {
          config.headers.Authorization = 'Bearer ' + $cookies.get('token');
        }
        return config;
      },

      // Intercept 401s and redirect you to login
      responseError: (response) => {
        if (response.status === 401) {
          (state || (state = $injector.get('$state'))).go('login');
          // remove any stale tokens
          $cookies.remove('token');
          return $q.reject(response);
        }
        else {
          return $q.reject(response);
        }
      }
    };
  })

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
