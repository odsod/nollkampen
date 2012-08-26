var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , log = require('../logs').app;

////
// Ad
////

var Ad = module.exports = new Schema({
  name:  { type: String, index: true }
});

Ad.plugin(require('./find-by-alias'), {
  attr: 'name'
});

Ad.plugin(require('./has-image').plugin);
