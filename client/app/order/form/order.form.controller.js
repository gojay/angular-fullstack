'use strict';

class OrderFormCtrl extends BaseFormCtrl {
  constructor($scope, order, Customer, Product, ...parentDependencies) {
    // $state, logger
    super(...parentDependencies);

    this.$scope = $scope;
    this.name = 'Order';
    this.model = order;

    this.Product = Product;
    this.Customer = Customer;

    this.formOptions = {
      customer: { add: false }
    };

    this._resetField();

    var unwatchSelected = this.$scope.$watch(() => this.selectedField._product, (newValue) => {
      if (!newValue) return;
      var stock = this._getSelectedItem(newValue._id);
      this.selectedField.max = newValue.stock - (stock ? stock.qty : 0);
      this.selectedField.qty = 1;
    }, true);

    this.$scope.$on('$destroy', unwatchSelected);
  }

  // ui-select: populate customers
  selectCustomers(q) {
    this.Customer.search({ q: q }, (customers) => {
      this.customers = customers;
    });
  }

  // ui-select: populate products
  selectProducts(q) {
    this.Product.search({ q: q }, (products) => {
      this.products = products;
    });
  }

  _getSelectedItem(productId) {
    return _.find(this.model._items, (m) => {
      return m._product._id == productId;
    });
  }

  _resetField() {
    this.selectedField = {
      _product: null,
      qty: null,
      max: 1
    };
    this.isAddingField = this.fieldKeyError = this.fieldValueError = false;
  }

  addField(form) {
    this.isAddingField = true;

    if (!this.selectedField._product) {
        this.fieldKeyError = true;
        return;
    }
    if (!this.selectedField.qty) {
        this.fieldValueError = true;
        return;
    }
    if (this.selectedField._product.stock < this.selectedField.qty) {
        this.logger.warning(`The maximum quantity is ${this.selectedField._product.stock}`, `Product ${this.selectedField._product.name}`);
        this.selectedField.qty = this.selectedField._product.stock;
        return;
    }

    var selected = this._getSelectedItem(this.selectedField._product._id);
    if (selected) {
      var sStock = selected.qty + this.selectedField.qty;
      if (selected._product.stock >= sStock) {
        selected.qty += this.selectedField.qty;
      } else {
        this.logger.warning(`The maximum quantity is ${this.selectedField.max} out of ${selected._product.stock}`, `Product ${this.selectedField._product.name}`);
        return;
      }
    } else {
      this.model._items.push(this.selectedField);
    }

    this._resetField();
  }

  removeField(index) {
    this.model._items.splice(index, 1);
  }

  // @override
  _beforeSave(form) {
    form.items.$setValidity('required', !_.isEmpty(this.model._items));
    // this.logger.log('override -> _beforeSave : check validity order items', form.items);
    // this.logger.log('model', this.model);
    return;
  }
}

OrderFormCtrl.$inject = ['$scope', 'order', 'Customer', 'Product', '$state', 'logger'];

angular.module('fullstackApp')
  .controller('OrderFormCtrl', OrderFormCtrl);
