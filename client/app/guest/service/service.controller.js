(() => {
    'use strict';

    class ServiceCtrl {
        constructor($scope, $state, $q, $timeout, $filter, Auth, OurService, Appointment, logger, Modal, CONFIG) {
            this.$state = $state;
            this.$q = $q;
            this.$timeout = $timeout;
            this.OurService = OurService;
            this.Appointment = Appointment;
            this.logger = logger;
            this.Modal = Modal;
            this.$filter = $filter;

            this.title = {};

            this.all = [];
            this.services = [];
            this.model = {};
            this.model.service = {};
            this.model.user = Auth.getCurrentUser() || {};
            this.isCustomer = Auth.isCustomer;

            this.config = {
                is: 'service',
                mode: 0, // column, tab, modal
                loading: false,
                calculating: false,
                submitted: false,
                service: {
                    end: false,
                    details: {},
                    summary: {},
                    history: []
                },
                coverage: {
                    region: CONFIG.service.region.map((item) => { item.name = item.name.toLowerCase(); return item; }),
                    area: null
                },
                cities: CONFIG.cities,
                datePicker: {
                	today: moment().format('dddd, DD MMM YYYY').toString(),
                	times: CONFIG.service.times,
                    minDate: moment().add(1, 'd').toDate(),
                    format: 'dd-MMMM-yyyy',
                    options: {
                        formatYear: 'yy',
                        startingDay: 1
                    },
                    disabled: []
                }
            };

            this.model.pickup = {
                date: this.config.datePicker.minDate,
                time: this.config.datePicker.times[0],
            };

            this._getOurService().then((data) => {
                angular.extend(this.all, data);
                this.items = data;
            });

            $scope.$on('$stateChangeSuccess', (env, to) => {
                this.config.submitted = false;
                if(/^book.service/.test(to.name)) {
                    this.config.is = 'service';
                } else if(/^book.appointment/.test(to.name)) {
                    this.config.is = 'appointment';
                    if (_.isEmpty(this.services)) {
                        return this.$state.go('book.service');
                    }
                }
                this._getDisabledDP();
            });

            var unWatchServices = $scope.$watch(() => this.services, this._getTitle(), true);
            $scope.$on('$destroy', unWatchServices);
        }

        getColumnClass(items) {
            if (_.isEmpty(items)) return 'col-md-3';
            switch (items.length) {
            case 1:
                return 'col-md-12';
                break;
            case 2:
                return 'col-md-6';
                break;
            case 3:
                return 'col-md-4';
                break;
            default:
                return 'col-md-3';
                break;
            }
        }

        _getTitle() {
            return (nv) => {

                // watch services
                // -------------------
                if (_.isEmpty(nv)) {
                    this.title = {
                        header: 'Our Services',
                        guide: 'Select a service'
                    };
                    return;
                }

                var item = _.last(nv);
                var type = _.first(nv).name;
                var history = this.config.service.history;
                // repairs
                if (type.toLowerCase() == 'repairs') {
                    switch (nv.length) {
                    case 0:
                    case 1:
                        this.title.header = 'Device Repair';
                        this.title.guide = 'Select your device';
                        break;
                    case 2:
                        this.title.header = `${item.name} Repair`;
                        this.title.guide = `Select your ${item.name.toLowerCase()}`;
                        this.config.service.details['Device'] = this.config.service.summary['Device'] = item.name;
                        // push history, from previous service
                        if(!_.find(history, 'key', 'Device')) {
                            history.push({ key: 'Device', value: item.name, previous: nv[0] });
                        }
                        break;
                    case 3:
                        this.title.header = 'Select Device Issue';
                        this.title.guide = `${item.name}`;
                        if (item.parent) {
                            this.config.service.summary['Brand'] = item.parent;
                            item.name = `${item.parent} ${item.name}`;
                            delete item.parent;
                        }
                        this.config.service.summary['Model'] = this.config.service.details['Model'] = item.name;
                        // push history, from previous service
                        if(!_.find(history, 'key', 'Model')) {
                            history.push({ key: 'Model', value: item.name, previous: nv[1] });
                        }
                        break;
                    case 4:
                        this.config.service.details['Issue'] = this.config.service.summary['Issue'] = item.name;
                        // push history, from previous service
                        if(!_.find(history, 'key', 'Issue')) {
                            history.push({ key: 'Issue', value: item.name, previous: nv[2] });
                        }
                        break;
                    }
                } 
                // setup & installations
                else if (/^setup/i.test(type)) {
                    switch (nv.length) {
                    case 1:
                        this.title.header = item.name;
                        this.title.guide = '';
                        break;
                    case 2:
                        this.config.service.summary['Setup'] = item.name;
                        break;
                    case 3:
                        if (item.parent) {
                            this.config.service.summary['Type'] = `${item.parent} - ${item.name}`;
                            delete item.parent;
                        }
                        break;
                    }
                }
            }
        }

        _calcServiceEstimatePrice() {
            if (_.isEmpty(this.services)) return;

            var params = {};
            // get last service
            params.origin = _.last(this.services)._id;
            // get reference service id
            var referenceService = _.find(this.services, (s) => {
                return _.has(s, 'reference');
            });
            if (referenceService) {
                params.reference = referenceService._id;
            }

            this.config.calculating = true;
            return this.OurService.calculate(params).$promise.then((result) => {
                angular.extend(this.model.service, _.pick(result, ['id', 'estimate_price', 'items', 'reference', 'step']));
                this.config.service.details['Price'] = this.$filter('currency')(this.model.service.estimate_price, 'IDR ', 0);
            }).catch((err) => {
                this.logger.error('Failed', 'calculating estimate price', err);
            }).finally(() => {
                this.config.calculating = false;
            })
        }

        _getOurService(item) {
            this.config.loading = true;

            var query = {
                type: 'children'
            };
            if (item) angular.extend(query, {
                reference: item.reference
            });
            return this.OurService.query(query).$promise
                .catch((err) => {
                    this.logger.error('Failed', 'load services', err)
                })
                .finally(() => {
                    this.config.loading = false;
                });
        }

        _addToService(item, parent) {
            this.items = item.children;

            // check duplicate, add to service
            // if (!_.find(this.services, '_id', item._id)) {
            var next = {
                _id: item._id,
                name: item.name,
                mode: item.mode,
                children: item.children,
                reference: item.reference,
            };
            if (parent) next.parent = parent.name;
            this.services.push(next);
            this.services = _.uniq(this.services, '_id');
            // }

            // end service
            if (_.isEmpty(this.items)) {
                // get the reference services
                // show the references in tabs
                // add the references to the previous item
                if (item.reference) {
                    return this._getOurService(item).then((references) => {
                        var seviceitem = _.last(this.services);
                        seviceitem.mode = 1;
                        seviceitem.children = references;
                        this.items = references;
                        this.config.mode = 1;
                    });
                }
                // service summary
                // get estimate price
                this.title.header = 'Service Summary';
                this.title.guide = null;
                this.config.service.end = true;
                this._calcServiceEstimatePrice();
            } else {
                this.config.service.end = false;
            }
        }

        getServiceChildren(item, parent) {
            // show in modal
            if (item.mode == 2) {
                return this.Modal.list({
                        templateUrl: 'select-screen-size.html',
                        windowClass: 'modal-service',
                        model: item.children
                    }, (selected) => this._addToService(selected, parent)) // resolve selected item, close modal
                    (['Select screen size']); // open modal with title
            }

            // set view mode
            this.config.mode = item.mode;
            // add to services
            this._addToService(item, parent);
        }
        getServiceParent(item, index) {
            this.config.service.end = false;

            if (item === 'all') {
                this.items = this.all;
                this.services = [];
                this.config.service.summary = {};
                this.config.service.history = [];
                this.config.mode = 0;
                return;
            }

            // set view mode
            this.config.mode = item.mode;

            if (_.last(this.services)._id == item._id) return;

            var is = _.findIndex(this.services, '_id', item._id);
            if (is > -1) {
                // set items
                this.items = angular.extend({}, this.services[is].children);
                // remove selected services
                _.remove(this.services, (n, k) => {  return k > is; });
                // remove history
                // find index by previous id
                if(angular.isUndefined(index)) {
                    index = _.findIndex(this.config.service.history, 'previous._id', item._id);
                }
                this.config.service.history.splice(index, this.config.service.history.length);
            }
        }

        /* Appointment */

        isActive(stepNumber, match = false) {
            var step = parseInt(stepNumber.match(/\d/)[0]);
            var currentStep = parseInt(this.$state.current.name.match(/\d/)[0]);
            return (match) ? step == currentStep : step <= currentStep ;
        }
        goTo(nextStep) {
            this.$state.go(`book.appointment.${nextStep}`);
        }

        getServiceDetails() {
            if(_.isEmpty(this.config.service.details)) return '';
            return _.values(this.config.service.details).join(', ');
        }

        /* Appointment Step 1 : Coverage Area */

        getCoverage(form) {
            this.config.submitted = true;
            if(form.$valid) {
                this.model.area = this.$filter('filter')(this.config.coverage.region, this.config.coverage.area.toLowerCase(), true)[0];
            }
        }

        notifyArea() {

        }

        /* Appointment Step 2 : Form */

        getFormClass(field) {
            if (field.$dirty || this.config.submitted) return field.$valid ? 'has-success' : 'has-error';
            return null;
        }
        isInteracted(field) {
            return this.config.submitted || field.$dirty;
        }
        nextStep(form, nextStep) {
            this.config.submitted = true;
            if (form.$invalid) return;
            this.config.submitted = false;
            this.$state.go(`book.appointment.${nextStep}`);
        }

        /* Appointment Step 3 : Pickup time (datepicker) */

        getSelectedPickup(format = 'dddd, DD MMM YYYY') {
            if(!this.model.pickup.date) return '';
        	return moment(this.model.pickup.date).format(format).toString();
        }

        _getDisabledDP() {
            if (_.isEmpty(this.model.user._id)) return;
            if (!_.isEmpty(this.config.datePicker.disabled)) return;

            this.Appointment.getDisabledPickup().$promise.then((results) => {
                this.config.datePicker.disabled = results;
                // return this.config.datePicker.disabled;
            }).catch((error) => {
                this.logger.log('_getDisabledDP:error', error);
            });
        }
        openDP($event) {
            $event.preventDefault();
            $event.stopPropagation();
            this.config.datePicker.opened = true;
            if (!this.model.pickuptime) {
                this.model.pickuptime = moment().format('DD-MMMM-YYYY');
            }
        }
        clearDP() {
            this.model.pickuptime = null;
        }
        disabledDP(date, mode) {
            var d = moment(date).format('DD-MM-YYYY');
            return (date.getDay() === 0 || date.getDay() === 6) || this.config.datePicker.disabled.indexOf(d) > -1;
        }
        getDayClassDP(date, mode) {
        	var d = moment(date).format('DD-MM-YYYY');
            var isDisabled = (date.getDay() === 0 || date.getDay() === 6) || moment(date).isBefore(moment()) || this.config.datePicker.disabled.indexOf(d) > -1;
            return isDisabled ? 'unavailable' : 'available';
        }

        /* booking */

        bookAppointment() {
            this.model.pickuptime = moment(this.model.pickup.date).hours(this.model.pickup.time.h).minutes(0).seconds(0).toDate();
            this.logger.log('booking', _.omit(this.model, 'pickup'));
        }
    }

    ServiceCtrl.$inject = ['$scope', '$state', '$q', '$timeout', '$filter', 'Auth', 'OurService', 'Appointment', 'logger', 'Modal', 'CONFIG'];

    angular.module('app.guest')
        .controller('ServiceCtrl', ServiceCtrl);

})();
