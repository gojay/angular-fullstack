'use strict';

class CustomerFormCtrl extends BaseFormCtrl {
	constructor(customer, ...parentDependencies) {
		super(...parentDependencies);
		this.name = 'Customer';
		this.model = customer;
	}
}

CustomerFormCtrl.$inject = ['customer', '$state', 'logger'];

angular.module('app.admin')
	.controller('CustomerFormCtrl', CustomerFormCtrl);
