'use strict';

angular.module('app.resources')
  .service('Appointment', AppointmentResource);

AppointmentResource.$inject = ['$resource'];

function AppointmentResource($resource) {
	var resource = $resource('/api/appointments/:id/:controller', {
      id: '@_id'
    }, {
    	query: {
            method: 'GET',
            isArray: true
        },
        getDisabledPickup: {
            method: 'GET',
            isArray: true,
            params: {
            	id: null,
                controller: 'disabled_pickup'
            }
        },
        get: {
            method: 'GET',
        },
        create: {
            method: 'POST'
        },
        update: {
            method: 'PUT'
        },
        remove: {
            method: 'DELETE'
        }
    });

    // overriding $save instead of $create or $update
    resource.prototype.$save = function() {
        if ( !this._id ) {
            return this.$create();
        }
        else {
            return this.$update();
        }
    };

    return resource;
}