var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , log = require('../logs').app;

////
// Slideshow
////

var Slideshow = module.exports = new Schema({
  name:   { type: String, index: true }
});

Slideshow.plugin(require('./has-image').plugin);

Slideshow.plugin(require('./find-by-alias'), {
  attr: 'name'
});
