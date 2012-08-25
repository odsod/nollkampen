/*jshint laxcomma: true */

var fs       = require('fs')
  , mongoose = require('mongoose')
  , Schema   = mongoose.Schema
  , ObjectId = mongoose.Schema.ObjectId
  , _        = require('underscore')
  , log      = require('./logs').app
  , db       = mongoose.createConnection('localhost', 'nollkampen');

////
// Named queries
////

function findBy(attr) {
  return function (value, callback) {
    var criteria = {};
    criteria[attr] = value;
    this.findOne(criteria, callback);
  };
}

////
// hasImage plugin
////

function hasImage(schema, options) {

  // Add data and mime subdocs
  schema.add({
    imageData: [{
      data: { type: Buffer, select: false }
    , mime: String
    }]
  });

  // Set a single image
  schema.virtual('image').set(function (image) {
    if (image && image.size > 0) {
      this.imageData = [{
        data: fs.readFileSync(image.path)
      , mime: image.mime
      }];
    }
  });

  // Set multiple images
  schema.virtual('images').set(function (images) {
    this.imageData = [];
    images.forEach(function (image) {
      if (image.size > 0) {
        this.imageData.push({
          data: fs.readFileSync(image.path)
        , mime: image.mime
        });
      }
    });
  });

  // Get url for a single image
  schema.virtual('image').get(function () {
    return options.urlRoot + '/' + this._id + '?model=' + options.model + '&i=0';
  });

  // Get urls for multiple images
  schema.virtual('images').get(function () {
    return _.map(_.range(this.imageData.length), function (i) {
      return options.urlRoot + '/' + this._id + '?model=' + options.model + '&i=' + i;
    });
  });
}

////
// Sequence
////

var Sequence = new Schema({
  name:    String
, actions: [String]
});

Sequence.virtual('alias').get(function () {
  return this.name;
});

Sequence.statics.findByAlias = findBy('name');

////
// Picture
////

var Picture = new Schema({
  name:    String
, caption: String
});

Picture.virtual('alias').get(function () {
  return this.name;
});

Picture.statics.findByAlias = findBy('name');

Picture.plugin(hasImage, {
  urlRoot: '/img'
, model: 'Picture'
});

////
// Result
////

var Result = new Schema({
  section:      { type: ObjectId, ref: 'Section', index: true }
, competition:  { type: ObjectId, ref: 'Competition', index: true }
, minutes:      Number
, seconds:      Number
, points:       Number
, disqualified: Boolean
});

Result.pre('save', function (next) {
  log.debug('LLOLOLOL');
  next();
});

Result.statics.compileTotal = function (callback) {
  this
    .find()
    .populate('competition')
    .populate('section')
    .exec(function (err, rs) {
      var results = _.map(rs, function (r) {
        return r.toObject({ getters: true });
      })
      , competitionResults = _.groupBy(results, function (r) {
        return r.competition.alias;
      })
      , sectionResults = _.groupBy(results, function (r) {
        return r.section.alias;
      });
      callback();
    });
};

////
// Competition
////

var Competition = new Schema({
  name: { type: String, index: true }
});

Competition.virtual('alias').get(function () {
  return this.name;
});

Competition.statics.findByAlias = findBy('name');

// Clean results on removal
Competition.pre('remove', function (next) {
  this.model('Result')
    .remove({ competition: this._id }, next);
});

Competition.statics.findByName = findBy('name');

////
// Section
////

var Section = new Schema({
  name:               String
, initials:           { type: String, index: { unique: true } }
, color:              String
, textColor:          String
, alternateTextColor: String
});

// Remove section results
Section.pre('remove', function (next) {
  this.model('Result')
    .remove({ section: this._id }, next);
});

Section.plugin(hasImage, {
  urlRoot: '/img'
, model: 'Section'
});

Section.virtual('alias').get(function () {
  return this.initials;
});

Section.statics.findByAlias = findBy('initials');

////
// Ad
////

var Ad = new Schema({
  name:  { type: String, index: true }
});

Ad.virtual('alias').get(function () {
  return this.name;
});

Ad.plugin(hasImage, {
  urlRoot: '/img'
, model: 'Ad'
});

Ad.statics.findByAlias = findBy('name');

////
// Slideshow
////

var Slideshow = new Schema({
  name:   { type: String, index: true }
});

Slideshow.plugin(hasImage, {
  urlRoot: '/img'
, model: 'Slideshow'
});

Slideshow.statics.findByName = findBy('name');

////
// Exports
////

module.exports = {
  Section:     db.model('Section',     Section)
, Competition: db.model('Competition', Competition)
, Result:      db.model('Result',      Result)
, Ad:          db.model('Ad',          Ad)
, Picture:     db.model('Picture',     Picture)
, Sequence:    db.model('Sequence',    Sequence)
, Slideshow:   db.model('Slideshow',   Slideshow)
};
