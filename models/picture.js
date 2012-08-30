////
// Picture
////

var Picture = module.exports = new (require('mongoose')).Schema({
  name:    { type: String, index: { unique: true } }
, caption: String
});

Picture.plugin(require('./find-by-alias'), {
  attr: 'name'
});

Picture.plugin(require('./has-image').plugin);
