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
// Result & ResultSheet
////

var Result = new Schema({
  section:      { type: ObjectId, ref: 'Section' }
, competition:  { type: ObjectId, ref: 'Competition' }
, minutes:      Number
, seconds:      Number
, disqualified: Boolean
, points:       Number
, place:        Number
});

var ResultSheet = new Schema({
  competition:    { type: ObjectId, ref: 'Competition', index: true }
, results: [Result]
});

ResultSheet.pre('save', function (next) {
  this.results.sort(function (r1, r2) {
    return r2.points - r1.points;
  });
  var currPlace = 0
    , currPoints = Number.POSITIVE_INFINITY;
  this.results.forEach(function (result) {
    if (result.poins < currPoints) {
      currPlace += 1;
      currPoints = result.points;
    }
    result.place = currPlace;
  });
  next();
});

ResultSheet.statics.compile = function (callback) {
  this
    .find()
    .populate('competition')
    .populate('results.section')
    .exec(function (err, ret) {
      var sheets = ret.toObject()
        , results = _.flatten(_.pluck(sheets, 'results'), true)
        , sectionResults = _.groupBy(results, function (result) {
          return result.section.initials;
        })
        , sectionTotals = _.map(sectionResults, function (results) {
            return {
              results : results
            , total: _.reduce(results, function (memo, result) {
                return memo + result.points;
              }, 0)
            };
          });
      callback(sheets);
    });
};

ResultSheet.statics.findByCompetitionName = function (name, callback) {
  this.model('Competition').findByName(name, function (err, competition) {
    this.findOne({ competition: competition._id }, callback);
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

// Make sure a result sheet exists for every competition
Competition.pre('save', function (next) {
  this.model('ResultSheet')
    .findOneAndUpdate({
      competition: this._id
    }, {
      // Just make sure it exists
    }, {
      upsert: true
    }, next);
});

// Remove result sheet upon competition removal
Competition.pre('remove', function (next) {
  this.model('ResultSheet')
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
  Section:     db.model('Section', Section)
, Competition: db.model('Competition', Competition)
, ResultSheet: db.model('ResultSheet', ResultSheet)
, Ad:          db.model('Ad', Ad)
, Picture:     db.model('Picture', Picture)
, Sequence:    db.model('Sequence', Sequence)
, Slideshow:   db.model('Slideshow', Slideshow)
};
