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

Result.virtual('time').get(function () {
  if (_.isNumber(this.minutes) && _.isNumber(this.seconds)) {
    return this.minutes + ':' + (this.seconds < 9 ? '0' : '') + this.seconds;
  } else {
    return ' ';
  }
});

Result.virtual('score').get(function () {
  if (this.disqualified) {
    return 'DISKAD!';
  } else if (this.points) {
    return this.points;
  } else {
    return ' ';
  }
});

Result.statics.compileTotal = function (callback) {
  this
    .find()
    .populate('competition')
    .populate('section')
    .exec(function (err, results) {
      // Prepare for takeoff...
      // Convert to regular objects
      results = _.map(results, function (result) {
        return result.toObject({ getters: true });
      });
      // Lift up section id (for grouping)
      results = _.map(results, function (result) {
        return _.extend(result, {
          sectionId: result.section.id
        });
      });
      // Group by section
      results = _.groupBy(results, 'sectionId');
      // Calculate total score and scrub results
      results = _.map(results, function (results, section) {
        // Extend with section data
        return _.extend(results[0].section, {
          // Calculate total score
          total: _.reduce(results, function (memo, result) {
            return memo + result.points;
          }, 0) || 0
          // Scrub results and sort by competition order
        , results: _.sortBy(_.map(results, function (result) {
            return {
              time: result.time,
              points: result.points,
              score: result.score,
              disqualified: result.disqualified,
              order: result.competition.order,
              competition: result.competition.id,
              competitionName: result.competition.name
            };
          }), 'order')
        });
      });
      // Sort by total score (descending)
      results = _.sortBy(results, function (section) {
        return - section.total;
      });
      log.data(results);
      callback(results);
    });
};

////
// Competition
////

var Competition = new Schema({
  name: { type: String, index: true }
, order: Number
});

Competition.virtual('alias').get(function () {
  return this.name;
});

Competition.statics.findByAlias = findBy('name');

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

// Initialize results
Section.pre('save', function (next) {
  var self = this;
  this.model('Competition').find(function (err, competitions) {
    competitions.forEach(function (competition) {
      self.model('Result').update({
        competition: competition._id
      , section: self._id
      }, {
        competition: competition._id
      , section: self._id
      }, {
        upsert: true
      }, function () { log.debug('upsert'); });
    });
    next();
  });
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
