var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , log = require('../logs').app;

var Section = module.exports = new Schema({
  initials:           { type: String, index: { unique: true } }
, name:               String
, color:              String
, textColor:          String
, alternateTextColor: String
});

// Initialize results
Section.pre('save', function (next) {
  var self = this;
  this.model('Competition').find(function (err, competitions) {
    competitions.forEach(function (competition) {
      self.model('Result').update({
        competition: competition._id
      , section: self._id
      }, {
        // TODO: find out if this is necessary and remove
        competition: competition._id
      , section: self._id
      }, {
        upsert: true
      }, function () {});
    });
    next();
  });
});

// Remove section results
Section.pre('remove', function (next) {
  this.model('Result').remove({ section: this._id }, next);
});

Section.plugin(require('./has-image').plugin);

Section.plugin(require('./find-by-alias'), {
  attr: 'initials'
});
