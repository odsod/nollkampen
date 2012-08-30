////
// Competition
////

var Competition = module.exports = new (require('mongoose')).Schema({
  name: { type: String, index: { unique: true } }
, order: Number
});

Competition.plugin(require('./find-by-alias'), {
  attr: 'name'
});

// Assure results exist on save
Competition.pre('save', function (next) {
  var self = this;
  this.model('Section').find(function (err, sections) {
    sections.forEach(function (section) {
      self.model('Result').update({
        competition: self._id
      , section: section._id
      }, {
        // TODO: make sure this is not necessary and delete
        competition: self._id
      , section: section._id
      }, {
        upsert: true
      }, function () { });
    });
    next();
  });
});

// Clean results on removal
Competition.pre('remove', function (next) {
  this.model('Result').remove({ competition: this._id }, next);
});
