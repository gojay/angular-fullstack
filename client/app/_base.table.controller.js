'use strict';

class BaseTableCtrl {
	constructor($injector) {
		this.$injector = $injector;
		this.$state = $injector.get('$state');
		this.Modal 	= $injector.get('Modal');
		this.logger = $injector.get('logger');
		this.utils 	= $injector.get('utils');

		var ngTableParams = $injector.get('ngTableParams');

		this.tableParams = {
        count: 10,
        sorting: {
            created: 'desc'
        }
    };
    this.table = new ngTableParams(this.tableParams, {
        total: 0,
        getData: this._getData()
    });

    this.logger.debug('BaseTableCtrl initialized', this);
	}

	set resource(resourceName) {
    	this.logger.debug('BaseTableCtrl set resource', resourceName);
		this._baseState = resourceName.toLowerCase();
		this._resourceName = resourceName;
		this._resource = this.$injector.get(resourceName);
	}

	_getData() {
		return ($defer, params) => {
			this.loading = true;
	        var query = this.utils.patchListParams(params);
	        this._resource.query(query, (materials, headers) => {
	            $defer.resolve(materials);
	            this.table.total(headers('X-Pagination-Total-Count'));
	            this.loading = true;
	        }, (err) => {
	            this.logger.error('Error occured!', 'Load materials', err);
	            this.loading = true;
	        });
		};
	}

	edit(id) {
		this.$state.go('^.edit', { id: id });
	}

	open(...params) {
		return this.Modal.resource({
	      	templateUrl: `app/admin/${this._baseState}/show.html`,
	      	resource: this._resourceName
	    })(...params);
	}

	deleteConfirm(...params) {
		return this.Modal.confirm.delete((material) => {
	        material.$remove(() => {
	            this.logger.success('Success!', 'Delete material', material);
	            this.table.reload();
	        }, (error) => {
	            this.logger.error('Error occured!', 'Delete material', err);
	        });
	    })(...params);
	}
}