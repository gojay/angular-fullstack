(() => {
	'use strict';

	class AdminServiceCtrl {
		constructor($scope, $timeout, OurService, Modal, logger) {
			this.$timeout = $timeout;
			this.OurService = OurService;
			this.Modal = Modal;
			this.logger = logger;

			this.name = 'Our Services';
			this.options = { edited: false, focused: false };

			this._getOurService();
			this._reset();
		}

		_getOurService() {
			this.OurService.query().$promise.then((services) => {
				this.data = services;
			}).catch((error) => {
				this.logger.error();
			})
		}

		_reset() {
			this.model = { name: null, price: 0 };
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
			this.model = { name: item.name, price: item.price };
		}

		saveItem(form, scope) {
			this.submited = true;
			if(form.$invalid) return;
			var item = scope.$modelValue;
			item.loading = true;

			angular.extend(item, this.model);
			// item.name = this._capitalize(item.name);

			var service = new this.OurService(item);
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
