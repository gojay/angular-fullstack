'use strict';

angular.module('fullstackApp')
  .service('Customer', CutomerResource);

CutomerResource.$inject = ['$resource'];

function CutomerResource($resource) {
	var resource = $resource('/api/customers/:id/:controller', {
      id: '@_id'
    }, {
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