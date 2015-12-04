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
      this.selectedField.max = newValue.stock;
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

  _resetField() {
    this.selectedField = {
      _product: null,
      qty: 1,
      max: 1
    };
    this.isAddingField = this.fieldKeyError = this.fieldValueError = false;
    this.logger.log('_resetField', this.selectedField);
  }

  addField(form) {
    this.isAddingField = true;

    this.logger.log('addField', this.selectedField, form);

    if (!this.selectedField._product) {
        this.fieldKeyError = true;
        return;
    }
    if (!this.selectedField.qty) {
        this.fieldValueError = true;
        return;
    }

    var selected = _.find(this.model._items, (m) => {
      return m._product._id == this.selectedField._product._id;
    });
    if (selected) {
      var sStock = selected.qty + this.selectedField.qty;
      this.logger.log(`qty: ${this.selectedField.qty}
        selected qty: ${selected.qty}
        in stock ${this.selectedField._product.stock}
        sStock ${sStock}
      `);
      if (this.selectedField._product.stock >= sStock) {
        selected.qty += this.selectedField.qty;
      } else {
        this.logger.warning('Maximum only add ' + this.selectedField._product.stock + ' qty', 'Product ' + this.selectedField._product.name);
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
    this.logger.log('override -> _beforeSave : check validity order items', form.items);
    this.logger.log('model', this.model);
    return;
  }
}

OrderFormCtrl.$inject = ['$scope', 'order', 'Customer', 'Product', '$state', 'logger'];

angular.module('fullstackApp')
  .controller('OrderFormCtrl', OrderFormCtrl);
