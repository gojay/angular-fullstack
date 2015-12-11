/*
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
import Thing from '../api/thing/thing.model';
import Material from '../api/material/material.model';
import User from '../api/user/user.model';
import Service from '../api/service/service.model';

import _ from 'lodash';
import Q from 'q';
import faker from 'faker';

const PRICES = [10000, 15000, 20000, 25000, 30000, 35000, 40000, 45000, 50000];
const PRICES2 = [100000, 200000, 300000, 400000, 500000, 600000, 700000, 800000];

var seed = {
  things() {
    return Thing.remove().exec()
    .then(function() {
      return Thing.create({
        name: 'Development Tools',
        info: 'Integration with popular tools such as Bower, Grunt, Babel, Karma, ' +
               'Mocha, JSHint, Node Inspector, Livereload, Protractor, Jade, ' +
               'Stylus, Sass, and Less.'
      }, {
        name: 'Server and Client integration',
        info: 'Built with a powerful and fun stack: MongoDB, Express, ' +
               'AngularJS, and Node.'
      }, {
        name: 'Smart Build System',
        info: 'Build system ignores `spec` files, allowing you to keep ' +
               'tests alongside code. Automatic injection of scripts and ' +
               'styles into your index.html'
      }, {
        name: 'Modular Structure',
        info: 'Best practice client and server structures allow for more ' +
               'code reusability and maximum scalability'
      }, {
        name: 'Optimized Build',
        info: 'Build process packs up your templates as a single JavaScript ' +
               'payload, minifies your scripts/css/images, and rewrites asset ' +
               'names for caching.'
      }, {
        name: 'Deployment Ready',
        info: 'Easily deploy your app to Heroku or Openshift with the heroku ' +
               'and openshift subgenerators'
      });
    });
  },
  materials() {
    return Material.remove().exec()
    .then(function() {
      var materials = _.times(20, function() {
        return {
          name: faker.commerce.productName(),
          price: PRICES[Math.floor(Math.random()*PRICES.length)],
          description: faker.commerce.productMaterial()
        };
      });
      return Material.create(materials);
    });
  },
  users() {
    return User.remove().exec()
    .then(function() {
      var users = [{
        provider: 'local',
        role: 'admin_m',
        name: 'Admin Material',
        email: 'admin.material@material.com',
        password: 'admin'
      }, {
        provider: 'local',
        role: 'admin_p',
        name: 'Admin Product',
        email: 'admin.product@material.com',
        password: 'admin'
      }, {
        provider: 'local',
        role: 'admin_co',
        name: 'Admin Customer & Order',
        email: 'admin.co@material.com',
        password: 'admin'
      }, {
        provider: 'local',
        role: 'root',
        name: 'Root',
        email: 'root@material.com',
        password: 'root'
      }];
      return User.create(users);
    });
  },
  service() {

    // Services
    // --------------------------
    
    var services = new Service({ name: 'Services', isRoot: true });

    var devices = {
      brandAsync(parent, type) {
        var brands = {
          // apple
          'smartphone.apple': [{
            name: 'iPhone 4'
          },{
            name: 'iPhone 4S'
          },{
            name: 'iPhone 5'
          },{
            name: 'iPhone 5S'
          },{
            name: 'iPhone 6'
          },{
            name: 'iPhone 6Plus'
          },{
            name: 'iPhone 6s'
          }, {
            name: 'Can\'t find your device model ?',
            description: 'Select by screen size instead',
            sizes: ['4 Inch', '5 Inch', '5.5 Inch']
          }],
          // samsung
          'smartphone.samsung': [{
            name: 'Galaxy Alpha'
          }, {
            name: 'Galaxy Note'
          }, {
            name: 'Galaxy Note 3'
          }, {
            name: 'Galaxy Note 4'
          }, {
            name: 'Galaxy Note Edge'
          }, {
            name: 'Galaxy S4'
          }, {
            name: 'Galaxy S5'
          }, {
            name: 'Can\'t find your device model ?',
            description: 'Select by screen size instead',
            sizes: ['4 Inch', '5 Inch', '5.5 Inch', '5.7 Inch']
          }],
          // xiaomi
          'smartphone.xiaomi': [{
            name: 'Redmi 2'
          }, {
            name: 'Redmi 2 Prime'
          }, {
            name: 'Redmi Note 2'
          }, {
            name: 'Redmi Note 2 Prime'
          }, {
            name: 'Redmi Note 3'
          }, {
            name: 'Redmi Note 4G'
          }, {
            name: 'Redmi 1S'
          }, {
            name: 'Can\'t find your device model ?',
            description: 'Select by screen size instead',
            sizes: ['4 Inch', '5 Inch', '5.5 Inch', '5.7 Inch']
          }]
        };

        var brand = brands[type];
        if(!brand) return Q.when('skip');

        var q = Q.defer();
        var promises = brand.reduce((promise, brand) => {
          return promise.then(() => {
            console.log(`save:children "${parent.name}" -> ${brand.name}`);
            if(!brand.sizes) {
              brand.price = PRICES[Math.floor(Math.random()*PRICES.length)];
            }
            brand.parent = parent;
            return Service.create(brand);
          }).then((result) => {
            if(!brand.sizes) return Q.when('OK');
            var saveSizes = _.map(brand.sizes, (v) => {
              var s = new Service({
                name: v,
                price: PRICES[Math.floor(Math.random()*PRICES.length)]
              });
              s.parent = result;
              return s.savePromise();
            });
            return Q.all(saveSizes);
          }).then(() => {
            return Q.when('sizes saved')
          });
        }, q.promise);
        q.resolve();
        return promises;
      },
      saveAsync(children, type) {
        var q = Q.defer();
        var promises = children.reduce((promise, item) => {
          return promise.then(() => {
            return item.savePromise();
          }).then((result) => {
            var deviceType = `${type}.${result.name.toLowerCase()}`;
            console.log(`saved ${deviceType}`);
            return this.brandAsync(result, deviceType);
          }).then((result) => {
            console.log(`--- children ${result} ---`);
            return;
          })
        }, q.promise);
        q.resolve();
        return promises;
      }
    };

      var repairs = new Service({ name: 'Repairs' });
        var smartphone = new Service({ name: 'Smartphone' });
        var smartphone_children = _.map(['Apple', 'Samsung', 'Xiaomi'], (v) => {
          console.log(`save:children "smartphone" -> ${v}`);
          var service = new Service({
            name: v,
            price: PRICES[Math.floor(Math.random()*PRICES.length)]
          });
          service.parent = smartphone;
          return service;
        });
        var tablet = new Service({ name: 'Tablet' });
        var tablet_children = _.map(['Apple', 'Samsung', 'LG'], (v) => {
          console.log(`save:children "tablet" -> ${v}`);
          var service = new Service({
            name: v,
            price: PRICES[Math.floor(Math.random()*PRICES.length)]
          })
          service.parent = tablet;
          return service;
        });
        var desktop = new Service({ name: 'Desktop' });
        var desktop_children = _.map(['iOS/Apple', 'Android'], (v) => {
          console.log(`save:children "desktop" -> ${v}`);
          var service = new Service({
            name: v,
            price: PRICES[Math.floor(Math.random()*PRICES.length)]
          });
          service.parent = desktop;
          return service;
        });
        var laptop = new Service({ name: 'Laptop' });
        var laptop_children = _.map(['Mac/Apple', 'Windows'], (v) => {
          console.log(`save:children "laptop" -> ${v}`);
          var service = new Service({
            name: v,
            price: PRICES[Math.floor(Math.random()*PRICES.length)]
          })
          service.parent = laptop;
          return service;
        });

      repairs.parent = services;
      smartphone.parent = repairs;
      tablet.parent     = repairs;
      desktop.parent    = repairs;
      laptop.parent     = repairs;

      var setup = new Service({ name: 'Setup & Instalations' });
        var ps = new Service({
          name: 'Printer Setup',
          price: PRICES2[Math.floor(Math.random()*PRICES2.length)]
        });
        var cs = new Service({
          name: 'Computer Setup',
          price: PRICES2[Math.floor(Math.random()*PRICES2.length)]
        });
        var ss = new Service({
          name: 'Server Setup',
          price: PRICES2[Math.floor(Math.random()*PRICES2.length)]
        });
        var rs = new Service({
          name: 'Router Setup',
          price: PRICES2[Math.floor(Math.random()*PRICES2.length)]
        });
        var si = new Service({ name: 'Software Install' });
          var sim = new Service({ name: 'Mobile Device' });
            var sim_children = _.map(['iOS / Apple', 'Android'], (v) => {
              console.log(`save:children "Software Install" -> ${v}`);
              var service = new Service({
                name: v,
                price: PRICES2[Math.floor(Math.random()*PRICES2.length)]
              });
              service.parent = sim;
              return service;
            });
          var sic = new Service({ name: 'Computer' });
            var sic_children = _.map(['Mac / Apple', 'Windows'], (v) => {
              console.log(`save:children "Computer" -> ${v}`);
              var service = new Service({
                name: v,
                price: PRICES2[Math.floor(Math.random()*PRICES2.length)]
              });
              service.parent = sic;
              return service;
            });

      setup.parent = services;
      ps.parent = setup;
      cs.parent = setup;
      ss.parent = setup;
      rs.parent = setup;
      si.parent = setup;
      sim.parent = si;
      sic.parent = si;

      var buildServices = () => {
        console.log('\nbuild services...\n');
        // repair
        var repairsAsync = repairs.savePromise().then(() => {
          console.log('save:children "repairs" -> %s', ['smartphone', 'tablet', 'desktop', 'laptop'].toString());
          return Q.all([
            smartphone.savePromise(),
            tablet.savePromise(),
            desktop.savePromise(),
            laptop.savePromise()
          ]).then(() => {
            var children = {
              'smartphone': smartphone_children,
              'tablet': tablet_children,
              'desktop': desktop_children,
              'laptop': laptop_children
            };

            console.log('saving children of "repairs"..');

            var qr = Q.defer();
            var p = _.reduce(children, (promise, c, k) => {
              return promise.then(() => {
                console.log(`------- save:children ${k}`);
                return devices.saveAsync(c, k);
              });
            }, qr.promise);
            qr.resolve();
            return p;
          });
        });
        // setup
        var setupAsync = setup.savePromise().then(() => {
          console.log('save:children "setup" -> %s', ['Printer Setup', 'Computer Setup', 'Server Setup', 'Router Setup', 'Software Install'].toString());
          return Q.all([
            ps.savePromise(),
            cs.savePromise(),
            ss.savePromise(),
            rs.savePromise(),
            si.savePromise()
          ]).then(() => {
            console.log('save:children "Software Install" -> %s', ['Mobile Device', 'Computer'].toString());
            var simAsync = sim.savePromise().then(() => {
              var promises = sim_children.map((d) => { return d.savePromise(); });
              return Q.all(promises);
            });
            var sicAsync = sic.savePromise().then(() => {
              var promises = sic_children.map((d) => { return d.savePromise(); });
              return Q.all(promises);
            });
            return Q.all([simAsync, sicAsync]);
          });
        });
        return Q.all([ repairsAsync, setupAsync ]);
      }

    // Issues
    // --------------------------
    
    var issues = new Service({ name: 'Issues', isRoot: true });
   
      var hardware = new Service({ name: 'Hardware' });
      hardware.parent = issues;
        var hardware_issues = [
          'Front glass replacement',
          'Screen replacement',
          'Home button repair',
          'Battery replacement',
          'Back camera repair',
          'Front camera repair',
          'Water damage'
        ];
        var hardware_children = _.map(hardware_issues, (v) => {
          console.log(`save:children "hardware" -> ${v}`);
          var service = new Service({
            name: v,
            price: PRICES2[Math.floor(Math.random()*PRICES2.length)]
          });
          service.parent = hardware;
          return service;
        });

      var software = new Service({ name: 'Software' });
      software.parent = issues;

      var buildIssues = () => {
        console.log('\nbuild issues...\n');
        // hardware
        var hardwareAsync = hardware.savePromise().then(() => {
          var promises = hardware_children.map((d) => { return d.savePromise(); });
          return Q.all(promises);
        });
        // software
        var softwareAsync = software.savePromise();
        return Q.all([ hardwareAsync, softwareAsync ]);
      }

    // save async
    //--------------------------------------

    return Service.remove().exec().then(() => {
      return Q.all([ services.savePromise(), issues.savePromise() ]);
    }).then((results) => {
      return Q.all([ buildServices(), buildIssues() ]);
    });
  },
  all() {
    return Q.all([
      this.things(),
      this.materials(),
      this.users()
    ]);
  }
};

export default seed;

// seed.service().then(function() {
//   console.log('seed successfull');
// }).then(null, function (error) {
//   console.log('seed error', error);
// });