'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var serviceCtrlStub = {
  index: 'serviceCtrl.index',
  show: 'serviceCtrl.show',
  create: 'serviceCtrl.create',
  update: 'serviceCtrl.update',
  destroy: 'serviceCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var serviceIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './service.controller': serviceCtrlStub
});

describe('Service API Router:', function() {

  it('should return an express router instance', function() {
    serviceIndex.should.equal(routerStub);
  });

  describe('GET /api/services', function() {

    it('should route to service.controller.index', function() {
      routerStub.get
        .withArgs('/', 'serviceCtrl.index')
        .should.have.been.calledOnce;
    });

  });

  describe('GET /api/services/:id', function() {

    it('should route to service.controller.show', function() {
      routerStub.get
        .withArgs('/:id', 'serviceCtrl.show')
        .should.have.been.calledOnce;
    });

  });

  describe('POST /api/services', function() {

    it('should route to service.controller.create', function() {
      routerStub.post
        .withArgs('/', 'serviceCtrl.create')
        .should.have.been.calledOnce;
    });

  });

  describe('PUT /api/services/:id', function() {

    it('should route to service.controller.update', function() {
      routerStub.put
        .withArgs('/:id', 'serviceCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('PATCH /api/services/:id', function() {

    it('should route to service.controller.update', function() {
      routerStub.patch
        .withArgs('/:id', 'serviceCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('DELETE /api/services/:id', function() {

    it('should route to service.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'serviceCtrl.destroy')
        .should.have.been.calledOnce;
    });

  });

});

var _ = require('lodash');
var Q = require('q');
var Service = require('./service.model');

const PRICES = [10000, 15000, 20000, 25000, 30000, 35000, 40000, 45000, 50000];

function recursive(serviceData, arr, parent) {
  if(_.isEmpty(arr)) {
    console.log('skip', arr);
    return Q.when('skip');
  }

  var q = Q.defer();
  var promises = arr.reduce((promise, service, index) => {
    return promise.then(() => {
      var data = _.omit(service, 'children');
      if(parent) data.parent = parent;
      console.log(`add ${service.name} -> parent ${parent ? parent.name : 'root'}`);
      return new Service(data);
      // return Service.create(data);
    }).then((s) => {
      serviceData.push(s);
      if(service.children){
        return recursive(serviceData, service.children, s);
      }
      return serviceData;
    }).then(null, (error) => {
      console.log('error', error);
    });
  }, q.promise);
  q.resolve();
  return promises
}

function _recursive(arr) {
  var q = Q.defer();
  var promises = arr.reduce((promise, service, index) => {
    return promise.then(() => {
      console.log(`save ${service}`);
      return Q.Promise((resolve, reject) => {
        service.save((err, result) => {
            console.log(err, result);
          if(err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      })
    }).then(null, (error) => {
      console.log('error', error);
    });
  }, q.promise);
  q.resolve();
  return promises
}

describe.only('Service model', function() {
  this.timeout(600000);

  var services = [
    {
      name: 'repairs',
      title: 'Repairs',
      price: PRICES[Math.floor(Math.random()*PRICES.length)],
      children: [
        {
          // parent: 'root',
          name: 'mobile',
          title: 'Mobile Device',
          price: PRICES[Math.floor(Math.random()*PRICES.length)],
          children: [
            {
              // parent: 'repairs',
              name: 'smartphone',
              title: 'Smartphone',
              price: PRICES[Math.floor(Math.random()*PRICES.length)],
              children: [
                {
                  // parent: 'mobile',
                  name: 'apple',
                  title: 'Apple',
                  price: PRICES[Math.floor(Math.random()*PRICES.length)]
                },
                {
                  // parent: 'mobile',
                  name: 'asus',
                  title: 'ASUS',
                  price: PRICES[Math.floor(Math.random()*PRICES.length)]
                },
                {
                  // parent: 'mobile',
                  name: 'samsung',
                  title: 'Samsung',
                  price: PRICES[Math.floor(Math.random()*PRICES.length)]
                },
                {
                  // parent: 'mobile',
                  name: 'lg',
                  title: 'LG',
                  price: PRICES[Math.floor(Math.random()*PRICES.length)]
                }
              ]
            },
            {
              // parent: 'repairs',
              name: 'tablet',
              title: 'Tablet',
              price: PRICES[Math.floor(Math.random()*PRICES.length)],
              children: [
                {
                  // parent: 'mobile',
                  name: 'apple',
                  title: 'Apple',
                  price: PRICES[Math.floor(Math.random()*PRICES.length)]
                },
                {
                  // parent: 'mobile',
                  name: 'asus',
                  title: 'ASUS',
                  price: PRICES[Math.floor(Math.random()*PRICES.length)]
                },
                {
                  // parent: 'mobile',
                  name: 'samsung',
                  title: 'Samsung',
                  price: PRICES[Math.floor(Math.random()*PRICES.length)]
                },
                {
                  // parent: 'mobile',
                  name: 'lg',
                  title: 'LG',
                  price: PRICES[Math.floor(Math.random()*PRICES.length)]
                }
              ]
            }
          ]
        },
        {
          // parent: 'root',
          name: 'computer',
          title: 'Computer',
          price: PRICES[Math.floor(Math.random()*PRICES.length)],
          children: [
            {
              // parent: 'repairs',
              name: 'desktop',
              title: 'Desktop',
              price: PRICES[Math.floor(Math.random()*PRICES.length)],
              children: [
                {
                  // parent: 'computer',
                  name: 'apple',
                  title: 'Apple',
                  price: PRICES[Math.floor(Math.random()*PRICES.length)]
                },
                {
                  // parent: 'computer',
                  name: 'asus',
                  title: 'ASUS',
                  price: PRICES[Math.floor(Math.random()*PRICES.length)]
                },
                {
                  // parent: 'computer',
                  name: 'samsung',
                  title: 'Samsung',
                  price: PRICES[Math.floor(Math.random()*PRICES.length)]
                },
                {
                  // parent: 'computer',
                  name: 'lg',
                  title: 'LG',
                  price: PRICES[Math.floor(Math.random()*PRICES.length)]
                }
              ]
            },
            {
              // parent: 'repairs',
              name: 'laptop',
              title: 'Laptop',
              children: [
                {
                  // parent: 'computer',
                  name: 'apple',
                  title: 'Apple',
                  price: PRICES[Math.floor(Math.random()*PRICES.length)]
                },
                {
                  // parent: 'computer',
                  name: 'asus',
                  title: 'ASUS',
                  price: PRICES[Math.floor(Math.random()*PRICES.length)]
                },
                {
                  // parent: 'computer',
                  name: 'samsung',
                  title: 'Samsung',
                  price: PRICES[Math.floor(Math.random()*PRICES.length)]
                },
                {
                  // parent: 'computer',
                  name: 'lg',
                  title: 'LG',
                  price: PRICES[Math.floor(Math.random()*PRICES.length)]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      name: 'setup',
      title: 'Setup & Instalations',
      price: PRICES[Math.floor(Math.random()*PRICES.length)],
      children: [
        {
          // parent: 'root',
          name: 'printer',
          title: 'Printer Setup',
          price: PRICES[Math.floor(Math.random()*PRICES.length)]
        },
        {
          // parent: 'root',
          name: 'computer',
          title: 'Computer Setup',
          price: PRICES[Math.floor(Math.random()*PRICES.length)]
        },
        {
          // parent: 'root',
          name: 'server',
          title: 'Server Setup',
          price: PRICES[Math.floor(Math.random()*PRICES.length)]
        },
        {
          // parent: 'root',
          name: 'router',
          title: 'Router Setup',
          price: PRICES[Math.floor(Math.random()*PRICES.length)]
        },
        {
          // parent: 'root',
          name: 'software',
          title: 'Software Install',
          price: PRICES[Math.floor(Math.random()*PRICES.length)],
          children: [
            {
              // parent: 'setup',
              name: 'mobile',
              title: 'Mobile Device',
              price: PRICES[Math.floor(Math.random()*PRICES.length)],
              children: [
                {
                  // parent: 'software',
                  name: 'ios',
                  title: 'iOS / Apple',
                  price: PRICES[Math.floor(Math.random()*PRICES.length)]
                },
                {
                  // parent: 'software',
                  name: 'android',
                  title: 'Android',
                  price: PRICES[Math.floor(Math.random()*PRICES.length)]
                }
              ]
            },
            {
              // parent: 'setup',
              name: 'mobile',
              title: 'Computer',
              price: PRICES[Math.floor(Math.random()*PRICES.length)],
              children: [
                {
                  // parent: 'software',
                  name: 'mac',
                  title: 'Mac / Apple',
                  price: PRICES[Math.floor(Math.random()*PRICES.length)]
                },
                {
                  // parent: 'software',
                  name: 'windows',
                  title: 'Windows',
                  price: PRICES[Math.floor(Math.random()*PRICES.length)]
                }
              ]
            }
          ]
        }
      ]
    }
  ];

  // before((done) => {
  //   Service.remove({}, done);
  // })

  it.skip('should build service', (done) => {
    
    var root = new Service({ name: 'root' });

    var repairs = new Service({
      name: 'Repairs',
      price: PRICES[Math.floor(Math.random()*PRICES.length)]
    });
    var mobile = new Service({
      name: 'Mobile Device',
      price: PRICES[Math.floor(Math.random()*PRICES.length)]
    });
      var smartphone = new Service({
        name: 'Smartphone',
        price: PRICES[Math.floor(Math.random()*PRICES.length)]
      });
      var smartphone_children = _.map(['Apple', 'ASUS', 'Samsung', 'LG'], (v) => {
        var service = new Service({
          name: v,
          price: PRICES[Math.floor(Math.random()*PRICES.length)]
        });
        service.parent = smartphone;
        return service;
      });
      var tablet = new Service({
        name: 'Tablet',
        price: PRICES[Math.floor(Math.random()*PRICES.length)]
      });
      var tablet_children = _.map(['Apple', 'ASUS', 'Samsung', 'LG'], (v) => {
        var service = new Service({
          name: v,
          price: PRICES[Math.floor(Math.random()*PRICES.length)]
        })
        service.parent = tablet;
        return service;
      });

    var computer = new Service({
      name: 'Computer',
      price: PRICES[Math.floor(Math.random()*PRICES.length)]
    });
      var desktop = new Service({
        name: 'Desktop',
        price: PRICES[Math.floor(Math.random()*PRICES.length)]
      });
      var desktop_children = _.map(['iOS/Apple', 'Android'], (v) => {
        var service = new Service({
          name: v,
          price: PRICES[Math.floor(Math.random()*PRICES.length)]
        });
        service.parent = desktop;
        return service;
      });
      var laptop = new Service({
        name: 'Laptop',
        price: PRICES[Math.floor(Math.random()*PRICES.length)]
      });
      var laptop_children = _.map(['Mac/Apple', 'Windows'], (v) => {
        var service = new Service({
          name: v,
          price: PRICES[Math.floor(Math.random()*PRICES.length)]
        })
        service.parent = laptop;
        return service;
      });

    repairs.parent = root;

    mobile.parent = repairs;
    smartphone.parent = mobile;
    tablet.parent = mobile;

    computer.parent = repairs;
    desktop.parent = computer;
    laptop.parent = computer;

    Q.all([
      Service.remove().exec(),
      root.savePromise()
    ]).then(() => {
      repairs.save(() => {
        mobile.save(() => {
          smartphone.save(() => {
            smartphone_children.map((d) => {
              d.save();
            });
          });
          tablet.save(() => {
            tablet_children.map((d) => {
              d.save();
            });
          });
        });
        computer.save(() => {
          desktop.save(() => {
            desktop_children.map((d) => {
              d.save();
            });
          });
          laptop.save(() => {
            laptop_children.map((d) => {
              d.save();
            });
          });
        })
      });
    })
  });

  it('should get roots', (done) => {
    Service.getRoots().then((result) => {
      console.log(JSON.stringify(result, null, 1));
      done();
    });
  });

  it('should get children', (done) => {
    Service.getAllChildren().then((result) => {
      console.log(JSON.stringify(result, null, 1));
      done();
    });
  });

  it('should get cost for "repair apple"', (done) => {
    Service.getCosts('566469acd53e9ec423331c8d').then((result) => {
      console.log(JSON.stringify(result, null, 1));
      done();
    });
  })
})
