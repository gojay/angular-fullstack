/*
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
import Thing from '../api/thing/thing.model';
import Material from '../api/material/material.model';
import User from '../api/user/user.model';
import Service from '../api/service/service.model';

import users from './dump.users';
import services from './dump.services';

import _ from 'lodash';
import Q from 'q';
import faker from 'faker';

const DELAY = 100;

let references = {};

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
      return User.create(users);
    });
  },

  service(data) {
    return Service.remove().exec().then(() => this._serviceRecursive(services.reverse()));
  },
  _serviceRecursive(arr, parent, dump = []) {
    var promises = arr.reduce((prev, next, index) => {
      return prev.then(data => {
        var _service_ = new Service(next);
        // parent
        if(parent) _service_.parent = parent;
        // reference
        if(next._reference && references.hasOwnProperty(next._reference)) _service_.reference = references[next._reference];
        // save promise
        return _service_.savePromise().then((service) => {
          if(!/services/i.test(service.name) && service.isRoot) {
            references[service.name.toLowerCase()] = service._id;
          }

          data.push(service.name);
console.log(`
--------------------------------------
parent      = ${parent ? parent.name : 'ROOT'} 
path        = ${service.path} 
reference   = ${service.reference || 'N/A'} 
name        = ${service.name}
description = ${service.description || 'N/A'} 
price       = ${service.price}`);
          if(_.isEmpty(next.children)) return Q.delay(DELAY).then(() => { return data; });
          return Q.delay(DELAY).then(() => seed._serviceRecursive(next.children, service, data));
        });
      });
    }, Q.when(dump));
    return promises;
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