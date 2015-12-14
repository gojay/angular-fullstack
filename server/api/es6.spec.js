'use strict';

import _ from 'lodash';
import Q from 'q';
import services from '../config/dump.services';

describe('ES6', function() {
  this.timeout(60000000);

  var tree = [
    { id: "0" },
    {
      id: "1",
      children: [
        {
          id: "1.1",
          children: [
            {
              id: "1.1.1",
              children: [
                {
                  id: "1.1.1.1",
                  children: [
                    { id: "1.1.1.1.1" },
                    { id: "1.1.1.1.2" },
                    { id: "1.1.1.1.3" }
                  ]
                },
                { id: "1.1.1.2" },
                { id: "1.1.1.3" }
              ]
            },
            { id: "1.1.2" },
            { id: "1.1.3" },
          ]
        },
        { id: "1.2" },
        { id: "1.3" }
      ]
    },
    { id: "2" },
    { id: "3" }
  ];

  const PRICES = [10000, 15000, 20000, 25000, 30000, 35000, 40000, 45000, 50000];

  describe('Promise', () => {

    let log = {};

    function recursive(arr, id = '', dump = [], tab = '') {
      var promises = arr.reduce((prev, next, index) => {
        return prev.then(dump => {
          let timeout = _.random(300, 1000);
          return Q.delay(timeout)
            .then(() => {
              dump.push(next.name);
              if(!id) {
                tab = '';
              } else if(log[id]) {
                tab = log[id];
              } else {
                // tab = tab.replace(/\s$/, '');
                tab += '  ';
                log[id] = tab;
              }
console.log(`
${tab}parent = ${id || 'services'} 
${tab}name   = ${next.name}
${tab}price  = ${next.price} 
${tab}take   = ${timeout}ms`);
              if(_.isEmpty(next.children)) return dump;
              return recursive(next.children, next.name, dump, tab);
            });
        });
      }, Q.when(dump));
      return promises;
    }

    it('recursively', (done) => {
      recursive(services)
        .then((result) => {
          // console.log(result);
          done()
        })
        .catch((err) => done(err));
    });

  });

  describe.skip('Generators', () => {
    /**
     * @see http://derickbailey.com/2015/07/19/using-es6-generators-to-recursively-traverse-a-nested-data-structure/
     */
    it('recursive function', (done) => {
      function p(val) {
        let timeout = _.random(1000, 5000);
        return Q.Promise((resolve, reject) => {
          setTimeout(() => {
            resolve(`${val.id} take ${timeout}ms`);
          }, timeout);
        });
      }

      function *processData(data){
        if (!data) { return; }

        for (let val of data){
          yield p(val);

          if (val.children) {
            yield *processData(val.children);
          }
        }
      }

      var it = processData(tree);
      var res = it.next();

      while(!res.done){
        res.value.then((x) => {
          console.log(x);
        });
        res = it.next();
      }
    });

    // 
    /**
     * @see https://gist.github.com/chrisbuttery/204375cab329d126d521
     */
    it.skip('control flow async', () => {
      /**
       * get - XHR Request
       */
      let get = function (url) {
        return function (callback) {
          callback(null, { url: url, message: 'ok' });
          /*let xhr = new XMLHttpRequest();
          xhr.open('GET', url);
          xhr.onreadystatechange = function() {
            let response = xhr.responseText;
            if(xhr.readyState != 4) return;
            if (xhr.status === 200) {
              callback(null, response);
            }
            else {
              callback(response, null);
            }
          };
          xhr.send();*/
        };
      };

      /**
       * getTweets (Generator)
       */
      let getTweets = function* () {
        let totalTweets = [];
        let data;

        // get the 1st tweet
        data = yield get('https://api.myjson.com/bins/2qjdn');
        totalTweets.push(data);

        // now get the 2nd tweet
        data = yield get('https://api.myjson.com/bins/3zjqz');
        totalTweets.push(data);

        // then get the 3rd tweet
        data = yield get('https://api.myjson.com/bins/29e3f');
        totalTweets.push(data);

        console.log(totalTweets);
      }

      /**
       * runGenerator
       * A function that takes a generator function and
       * recusively calls next() until `done: true`
       */
       
      let runGenerator = function (fn) {

        let next = function (err, arg) {
          if (err) return it.throw(err);

          var result = it.next(arg);
          if (result.done) return;

          if (typeof result.value == 'function') {
            result.value(next);
          }
          else {
            next(null, result.value);
          }
        }

        let it = fn();
        return next();
      }

      // kick it off
      runGenerator(getTweets);
    });

    /**
     * @see https://medium.com/@rdsubhas/es6-from-callbacks-to-promises-to-generators-87f1c0cd8f2e#.gamlwnn7r
     */
    it.skip('Promise -> 0 level flat!', (done) => {
      function promise1() {
        return Q.Promise((resolve, reject) => {
          setTimeout(() => {
            resolve('promise1 take 1000ms');
          }, 1000);
        });
      }
      function promise2() {
        return Q.Promise((resolve, reject) => {
          setTimeout(() => {
            resolve('promise2 take 2000ms');
          }, 2000);
        });
      }
      function promise3() {
        return Q.Promise((resolve, reject) => {
          setTimeout(() => {
            resolve('promise3 take 300ms');
          }, 300);
        });
      }
      function promise4() {
        return Q.Promise((resolve, reject) => {
          setTimeout(() => {
            reject('promise4 rejected!! 400ms');
          }, 400);
        });
      }

      function* asyncAll() {
        var res1 = yield promise1();
        console.log('pause', res1);
        var res2 = yield promise2();
        console.log('pause', res2);
        var res3 = yield promise3();
        console.log('pause', res3);
        var res4 = yield promise4();
        return {res1, res2, res3, res4};
      }

      var foo = Q.async(asyncAll);

      foo().then(message => {
        console.log("success!", message);
      }).catch(err => {
        console.log("error!", err);
      }).finally(() => {
        console.log("finally!");
        done();
      });
    });
    it.skip('Promise -> 0 level flat! ES7 async/await', (done) => {
      function promise1() {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve('promise1 take 1000ms');
          }, 1000);
        });
      }
      function promise2() {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve('promise2 take 2000ms');
          }, 2000);
        });
      }
      function promise3() {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve('promise3 take 300ms');
          }, 300);
        });
      }
      function promise4() {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            reject('promise4 rejected!! 400ms');
          }, 400);
        });
      }

      async function foo() {
        var res1 = await promise1();
        console.log('pause', res1);
        var res2 = await promise2();
        console.log('pause', res2);
        var res3 = await promise3();
        console.log('pause', res3);
        var res4 = await promise4();
        return {res1, res2, res3, res4};
      }

      foo().then(message => {
        console.log("success!", message);
        done();
      }).catch(err => {
        console.log("error!", err);
        done();
      });
    });
  });

});