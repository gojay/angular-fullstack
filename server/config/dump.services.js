'use strict';

const PRICES = [10000, 15000, 20000, 25000, 30000, 35000, 40000, 45000, 50000];
const PRICES2 = [100000, 200000, 300000, 400000, 500000, 600000, 700000, 800000];

var services = [
  {
    name: 'services',
    isRoot: true,
    price: 0,
    children: [
      {
        name: 'repairs',
        price: 0,
        description: 'We help to fix your device problems from repairing your broken screen to recovering your device data',
        children: [
          {
            name: 'smartphone',
            price: 0,
            mode: 1,
            children: [
              {
                name: 'apple',
                price: PRICES[Math.floor(Math.random()*PRICES.length)],
                children: [
                  {
                    name: 'iPhone 4',
                    price: PRICES[Math.floor(Math.random()*PRICES.length)],
                    _reference: 'issues'
                  },
                  {
                    name: 'iPhone 4S',
                    price: PRICES[Math.floor(Math.random()*PRICES.length)],
                    _reference: 'issues'
                  },
                  {
                    name: 'iPhone 5',
                    price: PRICES[Math.floor(Math.random()*PRICES.length)],
                    _reference: 'issues'
                  },
                  {
                    name: 'iPhone 5S',
                    price: PRICES[Math.floor(Math.random()*PRICES.length)],
                    _reference: 'issues'
                  },
                  {
                    name: 'iPhone 6',
                    price: PRICES[Math.floor(Math.random()*PRICES.length)],
                    _reference: 'issues'
                  },
                  {
                    name: 'iPhone 6Plus',
                    price: PRICES[Math.floor(Math.random()*PRICES.length)],
                    _reference: 'issues'
                  },
                  {
                    name: 'iPhone 6s',
                    price: PRICES[Math.floor(Math.random()*PRICES.length)],
                    _reference: 'issues'
                  }, 
                  {
                    name: 'Can\'t find your device model ?',
                    price: 0,
                    description: 'Select by screen size instead',
                    picture: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
                    children: [
                      {
                        name: '4 Inch',
                        price: PRICES[Math.floor(Math.random()*PRICES.length)],
                        _reference: 'issues'
                      },
                      {
                        name: '5 Inch',
                        price: PRICES[Math.floor(Math.random()*PRICES.length)],
                        _reference: 'issues'
                      },
                      {
                        name: '5.5 Inch',
                        price: PRICES[Math.floor(Math.random()*PRICES.length)],
                        _reference: 'issues'
                      }
                    ]
                  }
                ]
              },
              {
                name: 'asus',
                price: PRICES[Math.floor(Math.random()*PRICES.length)]
              },
              {
                name: 'samsung',
                price: PRICES[Math.floor(Math.random()*PRICES.length)],
                children: [
                  {
                    name: 'Galaxy Alpha',
                    price: PRICES[Math.floor(Math.random()*PRICES.length)],
                    _reference: 'issues'
                  },
                  {
                    name: 'Galaxy Note',
                    price: PRICES[Math.floor(Math.random()*PRICES.length)],
                    _reference: 'issues'
                  },
                  {
                    name: 'Galaxy Note 3',
                    price: PRICES[Math.floor(Math.random()*PRICES.length)],
                    _reference: 'issues'
                  },
                  {
                    name: 'Galaxy Note 4',
                    price: PRICES[Math.floor(Math.random()*PRICES.length)],
                    _reference: 'issues'
                  },
                  {
                    name: 'Galaxy Note Edge',
                    price: PRICES[Math.floor(Math.random()*PRICES.length)],
                    _reference: 'issues'
                  },
                  {
                    name: 'Galaxy S4',
                    price: PRICES[Math.floor(Math.random()*PRICES.length)],
                    _reference: 'issues'
                  },
                  {
                    name: 'Galaxy S5',
                    price: PRICES[Math.floor(Math.random()*PRICES.length)],
                    _reference: 'issues'
                  }, 
                  {
                    name: 'Can\'t find your device model ?',
                    price: 0,
                    description: 'Select by screen size instead',
                    picture: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
                    children: [
                      {
                        name: '4 Inch',
                        price: PRICES[Math.floor(Math.random()*PRICES.length)],
                        _reference: 'issues'
                      },
                      {
                        name: '5 Inch',
                        price: PRICES[Math.floor(Math.random()*PRICES.length)],
                        _reference: 'issues'
                      },
                      {
                        name: '5.5 Inch',
                        price: PRICES[Math.floor(Math.random()*PRICES.length)],
                        _reference: 'issues'
                      },
                      {
                        name: '5.7 Inch',
                        price: PRICES[Math.floor(Math.random()*PRICES.length)]
                      }
                    ]
                  }
                ]
              },
              {
                name: 'xiaomi',
                price: PRICES[Math.floor(Math.random()*PRICES.length)],
                children: [
                  {
                    name: 'Redmi 2',
                    price: PRICES[Math.floor(Math.random()*PRICES.length)],
                    _reference: 'issues'
                  },
                  {
                    name: 'Redmi 2',
                    price: PRICES[Math.floor(Math.random()*PRICES.length)],
                    _reference: 'issues'
                  },
                  {
                    name: 'Redmi 2',
                    price: PRICES[Math.floor(Math.random()*PRICES.length)],
                    _reference: 'issues'
                  },
                  {
                    name: 'Redmi 2',
                    price: PRICES[Math.floor(Math.random()*PRICES.length)],
                    _reference: 'issues'
                  },
                  {
                    name: 'Redmi Note 2 Prime',
                    price: PRICES[Math.floor(Math.random()*PRICES.length)],
                    _reference: 'issues'
                  },
                  {
                    name: 'Redmi Note 3',
                    price: PRICES[Math.floor(Math.random()*PRICES.length)],
                    _reference: 'issues'
                  },
                  {
                    name: 'Redmi Note 4G',
                    price: PRICES[Math.floor(Math.random()*PRICES.length)],
                    _reference: 'issues'
                  }, 
                  {
                    name: 'Can\'t find your device model ?',
                    price: 0,
                    description: 'Select by screen size instead',
                    picture: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
                    children: [
                      {
                        name: '4 Inch',
                        price: PRICES[Math.floor(Math.random()*PRICES.length)],
                        _reference: 'issues'
                      },
                      {
                        name: '5 Inch',
                        price: PRICES[Math.floor(Math.random()*PRICES.length)],
                        _reference: 'issues'
                      },
                      {
                        name: '5.5 Inch',
                        price: PRICES[Math.floor(Math.random()*PRICES.length)],
                        _reference: 'issues'
                      },
                      {
                        name: '5.7 Inch',
                        price: PRICES[Math.floor(Math.random()*PRICES.length)],
                        _reference: 'issues'
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            name: 'tablet',
            price: 0,
            mode: 1,
            children: [
              {
                name: 'apple',
                price: PRICES[Math.floor(Math.random()*PRICES.length)],
                _reference: 'issues'
              },
              {
                name: 'asus',
                price: PRICES[Math.floor(Math.random()*PRICES.length)],
                _reference: 'issues'
              },
              {
                name: 'samsung',
                price: PRICES[Math.floor(Math.random()*PRICES.length)],
                _reference: 'issues'
              },
              {
                name: 'LG',
                price: PRICES[Math.floor(Math.random()*PRICES.length)],
                _reference: 'issues'
              }
            ]
          },
          {
            name: 'desktop',
            price: 0,
            mode: 1,
            children: [
              {
                name: 'apple',
                price: PRICES[Math.floor(Math.random()*PRICES.length)]
              },
              {
                name: 'asus',
                price: PRICES[Math.floor(Math.random()*PRICES.length)]
              },
              {
                name: 'samsung',
                price: PRICES[Math.floor(Math.random()*PRICES.length)]
              },
              {
                name: 'LG',
                price: PRICES[Math.floor(Math.random()*PRICES.length)]
              }
            ]
          },
          {
            name: 'laptop',
            price: 0,
            mode: 1,
            children: [
              {
                name: 'apple',
                price: PRICES[Math.floor(Math.random()*PRICES.length)]
              },
              {
                name: 'asus',
                price: PRICES[Math.floor(Math.random()*PRICES.length)]
              },
              {
                name: 'samsung',
                price: PRICES[Math.floor(Math.random()*PRICES.length)]
              },
              {
                name: 'LG',
                price: PRICES[Math.floor(Math.random()*PRICES.length)]
              }
            ]
          }
        ]
      },
      {
        name: 'setup',
        price: 0,
        description: 'Our service ranges from software installation, OS migration, network & internet setup and eveything in between',
        children: [
          {
            name: 'printer',
            price: PRICES[Math.floor(Math.random()*PRICES.length)]
          },
          {
            name: 'computer',
            price: PRICES[Math.floor(Math.random()*PRICES.length)]
          },
          {
            name: 'server',
            price: PRICES[Math.floor(Math.random()*PRICES.length)]
          },
          {
            name: 'router',
            price: PRICES[Math.floor(Math.random()*PRICES.length)]
          },
          {
            name: 'software',
            price: 0,
            mode: 1,
            children: [
              {
                name: 'Mobile',
                price: 0,
                children: [
                  {
                    name: 'ios',
                    price: PRICES[Math.floor(Math.random()*PRICES.length)]
                  },
                  {
                    name: 'android',
                    price: PRICES[Math.floor(Math.random()*PRICES.length)]
                  }
                ]
              },
              {
                name: 'Desktop',
                price: 0,
                children: [
                  {
                    name: 'Mac/Apple',
                    price: PRICES[Math.floor(Math.random()*PRICES.length)]
                  },
                  {
                    name: 'windows',
                    price: PRICES[Math.floor(Math.random()*PRICES.length)]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }, 
  {
    name: 'issues',
    isRoot: true,
    price: 0,
    children: [
      {
        name: 'hardware',
        price: 0,
        mode: 1,
        children: [
          {
            name: 'Front glass replacement',
            price: PRICES2[Math.floor(Math.random()*PRICES2.length)]
          },
          {
            name: 'Screen replacement',
            price: PRICES2[Math.floor(Math.random()*PRICES2.length)]
          },
          {
            name: 'Home button repair',
            price: PRICES2[Math.floor(Math.random()*PRICES2.length)]
          },
          {
            name: 'Battery replacement',
            price: PRICES2[Math.floor(Math.random()*PRICES2.length)]
          },
          {
            name: 'Back camera repair',
            price: PRICES2[Math.floor(Math.random()*PRICES2.length)]
          },
          {
            name: 'Front camera repair',
            price: PRICES2[Math.floor(Math.random()*PRICES2.length)]
          },
          {
            name: 'Water damage',
            price: PRICES2[Math.floor(Math.random()*PRICES2.length)]
          }
        ]
      },
      {
        name: 'software',
        price: PRICES2[Math.floor(Math.random()*PRICES2.length)],
        mode: 1
      }
    ]
  }
];

export default services;