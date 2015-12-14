/**
 * Main application file
 */

'use strict';

import express from 'express';
import mongoose from 'mongoose';
import config from './config/environment';
import http from 'http';
import seed from './config/seed';

/**
 * Promise Finally
 * https://github.com/domenic/promises-unwrapping/issues/18
 */
Promise.prototype.finally = function (callback) {
    let p = this.constructor;
    // We don’t invoke the callback in here,
    // because we want then() to handle its exceptions
    return this.then(
        // Callback fulfills: pass on predecessor settlement
        // Callback rejects: pass on rejection (=omit 2nd arg.)
        value  => p.resolve(callback()).then(() => value),
        reason => p.resolve(callback()).then(() => { throw reason })
    );
};

// Connect to MongoDB
mongoose.connect(config.mongo.uri, config.mongo.options);
mongoose.connection.on('error', function(err) {
  console.error('MongoDB connection error: ' + err);
  process.exit(-1);
});

// Populate databases with sample data
if (config.seedDB) { 
	seed.service().then(() => console.log('Seed done!'));
}

// Setup server
var app = express();
var server = http.createServer(app);
var socketio = require('socket.io')(server, {
  serveClient: config.env !== 'production',
  path: '/socket.io-client'
});
require('./config/socketio')(socketio);
require('./config/express')(app);
require('./routes')(app);

// Start server
function startServer() {
  server.listen(config.port, config.ip, function() {
    console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
  });
}

setImmediate(startServer);

// Expose app
exports = module.exports = app;
