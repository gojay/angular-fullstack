/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
import Thing from '../api/thing/thing.model';
import Material from '../api/material/material.model';
import User from '../api/user/user.model';

import _ from 'lodash';
import Q from 'q';
import faker from 'faker';

const PRICES = [10000, 15000, 20000, 25000, 30000, 35000, 40000, 45000, 50000];

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
  all() {
    return Q.all([
      this.things(),
      this.materials(),
      this.users()
    ]);
  }
};
seed.all().then(function() {
  console.log('seed successfull');
}).then(null, function (error) {
  console.log('seed error', error);
});

/*
User.find({}).removeAsync()
  .then(function() {
    User.createAsync({
      provider: 'local',
      name: 'Test User',
      email: 'test@example.com',
      password: 'test'
    }, {
      provider: 'local',
      role: 'admin',
      name: 'Admin',
      email: 'admin@example.com',
      password: 'admin'
    })
    .then(function() {
      console.log('finished populating users');
    });
  });
*/