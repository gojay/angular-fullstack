'use strict';

angular.module('fullstackApp')
	.factory('logger', logger);

logger.$inject = ['$log', 'toastr'];

function logger($log, toastr) {
	var service = {
    success: success,
    info: info,
    warning: warning,
    error: error,
    debug: $log.debug,
    log: $log.log
  };

  return service;

  function success(message, title, debug, options) {
    $log.info('logger:success:', message, debug);
    toastr.success(message, title, options);
  }
  function info(message, title, debug, options) {
    $log.info('logger:info:', message, debug);
    toastr.info(message, title, options);
  }
  function warning(message, title, debug, options) {
    $log.info('logger:warning:', message, debug);
    toastr.warning(message, title, options);
  }
  function error(message, title, debug) {
    $log.info('logger:error:', message, debug);
    toastr.error(message, title, {
      closeButton: true,
      timeOut: 0,
      positionClass: 'toast-top-full-width'
    });
  }
}