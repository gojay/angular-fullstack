/**
 * AngularJS directive that will trigger focus on an element under specified conditions
 * @see https://github.com/hiebj/ng-focus-if
 */

'use strict';

angular
  .module('app.directives')
  .directive('focusIf', focusIf);

focusIf.$inject = ['$timeout'];

function focusIf($timeout) {
  function link($scope, $element, $attrs) {
    var dom = $element[0];
    if ($attrs.focusIf) {
        $scope.$watch($attrs.focusIf, focus);
    } else {
        focus(true);
    }
    function focus(condition) {
        if (condition) {
            $timeout(function() {
                dom.focus();
            }, $scope.$eval($attrs.focusDelay) || 0);
        }
    }
  }
  return {
    restrict: 'A',
    link: link
  };
}
