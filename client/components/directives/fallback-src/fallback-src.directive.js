'use strict';

angular.module('fullstackApp')
  .factory('fallbackSrc', fallbackSrc);

function fallbackSrc() {
  var directive = {
    link: link
  };
  return directive;

  function link(scope, element, iAttrs) {
    element.bind('error', function() {
      angular.element(this).attr("src", iAttrs.fallbackSrc);
    });
    scope.$on('$destroy', function() {
      element.unbind('error');
    });
  }
}