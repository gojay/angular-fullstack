'use strict';

angular.module('app.layout')
  .directive('footer', function () {
    return {
      templateUrl: 'app/layout/footer/footer.html',
      restrict: 'E',
      link: function (scope, element) {
        element.addClass('footer');
      }
    };
  });
