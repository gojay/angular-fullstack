'use strict';

angular.module('app.resources')
  .service('OurService', OurService);

OurService.$inject = ['$resource'];

function OurService($resource) {
	var resource = $resource('/api/services/:id/:controller', { id: '@_id' }, {
    	query: {
            method: 'GET',
            isArray: true
        },
        search: {
            method: 'GET',
            isArray: true,
            params: {
                controller: 'search'
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