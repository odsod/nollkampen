var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , log = require('../logs').app;

////
// Picture
////

var Picture = module.exports = new Schema({
  name:    String
, caption: String
});

Picture.plugin(require('./find-by-alias'), {
  attr: 'name'
});

Picture.plugin(require('./has-image').plugin);
