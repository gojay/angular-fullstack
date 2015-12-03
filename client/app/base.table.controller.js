'use strict';

class BaseTableCtrl {
	constructor($state, resource, ngTableParams, Modal, logger, utils) {
		this.$state = $state;

		this.resource = resource;
		this.Modal = Modal;
		this.logger = logger;
		this.utils = utils;

		this.params = {
	        count: 10,
	        sorting: {
	            created: 'desc'
	        }
	    };
	    this.table = new ngTableParams(this.params, {
	        total: 0,
	        getData: this._getData()
	    });

	    logger.debug('BaseTableCtrl initialized', this);
	}

	_getData() {
		return ($defer, params) => {
			this.loading = true;
	        var query = this.utils.patchListParams(params);
	        this.resource.query(query, (materials, headers) => {
	            $defer.resolve(materials);
	            this.table.total(headers('X-Pagination-Total-Count'));
	            this.loading = true;
	        }, (err) => {
	            this.logger.error('Error occured!', 'Load materials', err);
	            this.loading = true;
	        });
		};
	}

	goToDetail(id) {
		this.$state.go(`${this.resource.name}.edit`, { _id: id });
	}

	showOnModal(...params) {
		return Modal.resource({
	        templateUrl: `app/${this.resource.name}/show.html`,
	        resource: this.resource.name
	    })(...params);
	}

	deleteOnModal(...params) {
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