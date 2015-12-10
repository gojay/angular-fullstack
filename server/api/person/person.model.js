'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));
var Schema = mongoose.Schema;

var PersonSchema = new Schema({
  name: String,
  profile_picture: String,
  info: String,
  active: Boolean,
  created: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Person', PersonSchema);
