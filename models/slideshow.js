////
// Slideshow
////

var Slideshow = module.exports = new (require('mongoose')).Schema({
  name:   { type: String, index: { unique: true } }
});

Slideshow.plugin(require('./has-image').plugin);

Slideshow.plugin(require('./find-by-alias'), {
  attr: 'name'
});
