var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , log = require('../logs').app;

////
// Sequence
////

var Sequence = module.exports = new Schema({
  name:    String
, actions: [String]
});

Sequence.plugin(require('./find-by-alias'), {
  attr: 'name'
});
