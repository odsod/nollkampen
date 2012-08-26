var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , log = require('../logs').app;

////
// Competition
////

var Competition = module.exports = new Schema({
  name: { type: String, index: true }
, order: Number
});

Competition.plugin(require('./find-by-alias'), {
  attr: 'name'
});

// Initialize results
Competition.pre('save', function (next) {
  var self = this;
  this.model('Section').find(function (err, sections) {
    sections.forEach(function (section) {
      self.model('Result').update({
        competition: self._id
      , section: section._id
      }, {
        competition: self._id
      , section: section._id
      }, {
        upsert: true
      }, function () { log.debug('upsert'); });
    });
    next();
  });
});

// Clean results on removal
Competition.pre('remove', function (next) {
  this.model('Result')
    .remove({ competition: this._id }, next);
});
