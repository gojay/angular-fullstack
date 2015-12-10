(() => {
	'use strict';

	class AdminServiceCtrl {
		constructor($scope, $timeout, OurService, Modal, logger) {
			this.$timeout = $timeout;
			this.OurService = OurService;
			this.Modal = Modal;
			this.logger = logger;

			this.name = 'Our Services';
			this.options = { edited: false, focused: false, detail: false, modes: [
				{ id: 0, title: 'Direct' },
				{ id: 1, title: 'Reference' }
			] };

			this._getOurService();
			this._reset();
		}

		_getOurService() {
			this.OurService.query().$promise.then((services) => {
				this.data = services;
				this.references = _(services).filter((s) => {
					return !/service/i.test(s.name);
				}).map((s) => {
					return _.pick(s, ['_id', 'name']);
				}).value();
			}).catch((error) => {
				this.logger.error();
			})
		}

		_reset() {
			this.model = { name: null, price: 0, mode: 0, picture: null, description: null };
			this.submited = false;
			this.options.edited = false;
			this.options.focused = false;
		}

		_capitalize(str) {
			return str.toLowerCase().replace( /\b\w/g, (m) => {
		        return m.toUpperCase();
		      });
		}

		getInitial(str) {
			return str.match(/\b(\w)/g).join('');      
		}

		toggle(scope) {
			scope.toggle();
		}

		addItem(scope) {
			this.options.edited = true;
			this.options.focused = true;
			var item = scope.$modelValue;
			item.children.push({
				id: item._id,
				parent: item._id,
				name: item.name,
				edited: true,
				children: []
			});
		}

		editItem(scope) {
			var item = scope.$modelValue;
			item.edited = !item.edited;
			this.options.edited = !this.options.edited;
			this.options.focused = !this.options.focused;
			if(this.options.edited) {
				this.model = _.pick(item, ['name', 'price', 'mode', 'picture', 'description', 'reference']);
			} else {
				this._reset();
			}
		}

		saveItem(form, scope) {
			this.submited = true;
			if(form.$invalid) return;
			var item = scope.$modelValue;
			item.loading = true;

			angular.extend(item, this.model);
			// item.name = this._capitalize(item.name);

			var service = new this.OurService(item);
			if(service.reference && service.mode == 0) {
				service.reference = null;
			}
			this.logger.log('Save', service);
			service.$save().then((result) => {
				item._id = result._id;
				this.logger.info('Saved successfully', service.name, item);
			}).catch((error) => {
				this.logger.error('Failed!!', service.name, error);
			}).finally(() => {
				item.edited = false;
				item.loading = false;
				this._reset();
			});
		}

		removeItem(scope) {
			var item = scope.$modelValue;
			if(!item.hasOwnProperty('_id')) {
				this._reset();
				return scope.remove();
			}
			this.Modal.confirm.delete(() => {
				item.deleting = this.options.edited = true;
				var service = new this.OurService(item);
				service.$remove().then(() => {
					this.logger.success('Success!', `Delete ${item.name}`);
						scope.remove();
					}).catch((error) => {
						this.logger.error('Error occured!', `Delete ${item.name}`, error);
					}).finally(() => {
						item.deleting = false;
						this._reset();
					});
			})('');
		}
	}

	AdminServiceCtrl.$inject = ['$scope', '$timeout', 'OurService', 'Modal', 'logger'];

	angular.module('app.admin')
	  .controller('AdminServiceCtrl', AdminServiceCtrl);

})();
