////
// Ad
////

var Ad = module.exports = new (require('mongoose')).Schema({
  name:  { type: String, index: { unique: true } }
});

Ad.plugin(require('./find-by-alias'), {
  attr: 'name'
});

Ad.plugin(require('./has-image').plugin);
