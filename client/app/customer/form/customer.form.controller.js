'use strict';

class CustomerFormCtrl extends BaseFormCtrl {
	constructor(customer, ...parentDependencies) {
		super(...parentDependencies);
		this.name = 'Customer';
		this.model = customer;
	}
}

CustomerFormCtrl.$inject = ['customer', '$state', 'logger'];

angular.module('fullstackApp')
	.controller('CustomerFormCtrl', CustomerFormCtrl);
