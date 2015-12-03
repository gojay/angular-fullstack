'use strict';

class BaseFormCtrl {
	constructor($state, logger) {
		this.$state = $state;
		this.logger = logger;
		
		this.submitted = false;

    this.logger.debug('BaseFormCtrl initialized', this);
	}

	getFormClass(field) {
		if(field.$dirty || this.submitted) return field.$valid ? 'has-success' : 'has-error' ;
		return null;
	}

	isInteracted(field) {
		return this.submitted || field.$dirty;
	}

	get title() {
		return this.model.name || this.name;
	}

	_beforeSave(form) {
		this.logger.debug('_beforeSave');
	}

	save(form) {
		this.submitted = true;
		this._beforeSave(form);
		if( form.$valid ) {
			this.loading = true;
			this.model.$save().then((data) => {
				this.loading = this.submitted = false;
				this.$state.go('^.index');
				this.logger.success('Saved successfuly', this.title);
			}, (error) => {
				this.logger.error(`Failed add ${this.title}`, 'Something went wrong!!', error);
			});
		} 
	}
}