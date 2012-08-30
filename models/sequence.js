////
// Sequence
////

var Sequence = module.exports = new (require('mongoose')).Schema({
  name:    String
, actions: [String]
});

Sequence.plugin(require('./find-by-alias'), {
  attr: 'name'
});
