/*jshint laxcomma: true */

var fs       = require('fs')
  , mongoose = require('mongoose')
  , Schema   = mongoose.Schema
  , ObjectId = mongoose.Schema.ObjectId
  , _        = require('underscore')
  , log      = require('./logs').app
  , db       = mongoose.createConnection('localhost', 'nollkampen');

////
// Error handler
////

function handleError(err) {
  if (err) {
    log.error(err);
  }
}

////
// Sequence
////

var Sequence = new Schema({
  name:    String
, actions: [String]
});

////
// Picture
////

var Picture = new Schema({
  name:    String
, caption: String
, image:   { type: ObjectId, ref: 'ImageData' }
});

////
// Score
////

var ScoreSheet = new Schema({
  competition: { type: ObjectId, ref: 'Competition', index: true }
, scores: [new Schema({
    section: { type: ObjectId, ref: 'Section'}
  , points: Number
  , place: Number
  })]
});

var TimeSheet = new Schema({
  competition: { type: ObjectId, ref: 'Competition', index: true }
, times: [{ section: ObjectId, time: String }]
});

var Score = new Schema({
  section:     { type: ObjectId, ref: 'Section', index: true }
, competition: { type: ObjectId, ref: 'Competition', index: true }
, points:      Number
});

Score.pre('save', function (next) {
  this.model('Section').findById(this.section, function (err, section) {
    section.scores.addToSet(this);
  });
  this.model('Competition').findById(this.competition, function (err, competition) {
    competition.scores.addToSet(this);
  });
});

////
// Time
////

var Time = new Schema({
  section:     { type: ObjectId, ref: 'Section', index: true }
, competition: { type: ObjectId, ref: 'Competition', index: true }
, minutes:      Number
, seconds:      Number
, disqualified: Boolean
});

Time.pre('save', function (next) {
  this.model('Section').findById(this.section, function (err, section) {
    section.times.addToSet(this);
  });
  this.model('Competition').findById(this.competition, function (err, competition) {
    competition.times.addToSet(this);
  });
});

Time.virtual('text').get(function () {
  var pad = this.seconds < 10 ? '0' : '';
  return this.disqualified ? 'DISKAD' :
         this.minutes + ':' + pad + this.seconds;
});

////
// Competition
////

var Competition = new Schema({
  name:   { type: String, index: true }
, results: [{ section: ObjectId, time: String, points: Number, place: Number }]
});

////
// Section
////

var Section = new Schema({
  name:               String
, initials:           { type: String, index: { unique: true } }
, color:              String
, textColor:          String
, alternateTextColor: String
, image:              { type: ObjectId, ref: 'ImageData' }
, times:              [Time]
, scores:             [Score]
, results:            [{ competition: ObjectId, time: String, points: Number }]
, total:              Number
, place:              Number
});

////
// Ad
////

var Ad = new Schema({
  name:  { type: String, index: true }
, image: { type: ObjectId, ref: 'ImageData' }
});

////
// Slideshow
////

var Slideshow = new Schema({
  name:   { type: String, index: true }
, images: [{ type: ObjectId, ref: 'ImageData' }]
});

Slideshow.pre('remove', function (next) {
  this.images.remove(next);
});

////
// ImageData
////

var ImageData = new Schema({
  data:  { type: Buffer, required: true }
, mime:  { type: String, required: true }
});

ImageData.virtual('file').set(function (file) {
  this.data = fs.readFileSync(file.path);
  this.mime = file.mime;
});

function setImageData(file, callback) {
  var self      = this
    , ImageData = db.model('ImageData');
  function doCreate(err) {
    var image = new ImageData();
    image.file = file;
    image.save(function (err, image) {
      self.image = image._id;
      callback(self);
    });
  }
  if (file.size > 0) {
    if (this.image) {
      // Remove old image
      this.model('ImageData')
        .where('_id').equals(this.image)
        .remove(doCreate);
    } else {
      doCreate(null);
    }
  } else {
    callback(this);
  }
}

function removeImage(next) {
  this.model('ImageData')
    .where('_id').equals(this.image)
    .remove(next);
}

// Apply setImageData to imagemodels
[Section, Ad, Picture].forEach(function (Model) {
  Model.methods.setImageData = setImageData;
  Model.pre('remove', removeImage);
});

////
// Results removal
////

function removeTimes(next) {
  this.times.remove(next);
}

function removeScores(next) {
  this.scores.remove(next);
}

[Section, Competition].forEach(function (Model) {
  Model.pre('remove', removeTimes);
  Model.pre('remove', removeScores);
});

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

// Make section findable by initials
Section.statics.findByInitials = findBy('initials');
// Make score sheets findable by competition name (and populate sections)
ScoreSheet.statics.findByCompetition = function (value, callback) {
  this
    .findOne({ competition: value })
    .populate('scores.section')
    .run(callback);
};
// Make other models findable by name
[Competition, Picture, Ad, Sequence, Slideshow]
.forEach(function (Model) {
  Model.statics.findByName = findBy('name');
});

// Model EVERYTHING!
db.model('ImageData', ImageData);
db.model('Section', Section);
db.model('Competition', Competition);
db.model('Time', Time);
db.model('Score', Score);
db.model('Ad', Ad);
db.model('Picture', Picture);
db.model('Sequence', Sequence);
db.model('Slideshow', Slideshow);
db.model('ScoreSheet', ScoreSheet);

module.exports = db;
