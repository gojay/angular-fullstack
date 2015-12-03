/**
 * Custom Validations & Error Messages
 * @see http://www.yearofmoo.com/2014/05/how-to-use-ngmessages-in-angularjs.html
 *      http://plnkr.co/edit/i7CLvDUj5FllexJP00Zx?p=preview
 */

'use strict';

angular.module('fullstackApp')
    .directive('recordAvailabilityValidator', [
        '$http', '$q', '$timeout',
        function($http, $q, $timeout) {
            return {
                require: 'ngModel',
                link: function(scope, element, attrs, ngModel) {
                    var apiUrl = attrs.recordAvailabilityValidator;

                    /* use async promise for model validator $pending */
                    ngModel.$asyncValidators.recordAvailabilityValidator = function(value) {
                        var defer = $q.defer();
                        if(ngModel.$pristine) {
                            defer.resolve();
                        } else {
                            var params = { q: value };
                            $http.get(apiUrl, { params: params, ignoreLoadingBar: true }).success(function() {
                                defer.resolve();
                            }).error(function() {
                                defer.reject();
                            });
                        }
                        return defer.promise;
                    }

                    /*function setAsLoading(bool) {
                        ngModel.$setValidity('recordLoading', !bool);
                    }

                    function setAsAvailable(bool) {
                        ngModel.$setValidity('recordAvailable', bool);
                    }
                    ngModel.$parsers.push(function(value) {
                        if (!value || value.length == 0) return;

                        setAsLoading(true);
                        setAsAvailable(false);

                        $http.get(apiUrl, { v: value })
                            .success(function() {
                                setAsLoading(false);
                                setAsAvailable(true);
                            })
                            .error(function() {
                                setAsLoading(false);
                                setAsAvailable(false);
                            });

                        return value;
                    });*/
                }
            }
        }
    ])
    .directive('accessibleForm', function ($location, $anchorScroll, logger) {
        return {
            restrict: 'A',
            link: function (scope, elem) {

                // set up event handler on the form element
                elem.on('submit', function () {

                    // find the first invalid element
                    var firstInvalid = angular.element(elem[0].querySelector('.ng-invalid'));

                    // if we find one, set focus
                    if (firstInvalid[0]) {
                        if(_.has(firstInvalid[0], 'autofocus')) {
                            firstInvalid.focus();
                        } else {
                            var newHash = elem.attr('name') + '-' + firstInvalid.attr('name');
                            if ($location.hash() !== newHash) {
                                $location.hash(newHash);
                            } else {
                                $anchorScroll.yOffset = 60;
                            }
                        }
                        logger.warning('Field ' + firstInvalid.attr('name'), 'Form invalid');
                    }

                });
            }
        };
    });
