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
// ImageData
////

var ImageData = new Schema({
  data:  { type: Buffer, required: true }
, mime:  { type: String, required: true }
, owner: ObjectId
});

ImageData.virtual('file').set(function (file) {
  this.data = fs.readFileSync(file.path);
  this.mime = file.mime;
});

function removePreviouslyOwnedImages(next) {
  // Find all images which is currently not used (this.image)
  this.model('ImageData')
    .where('owner').equals(this._id)
    .where('_id').ne(this.image)
    .remove(next);
}

function removeAllOwnedImages(next) {
  this.model('ImageData')
    .where('owner').equals(this._id)
    .remove(next);
}

function markImageAsOwned(next) {
  this.model('ImageData')
    .where('_id').equals(this.image)
    .update({ owner: this._id }, next);
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

Picture.pre('save', removePreviouslyOwnedImages);
Picture.pre('save', markImageAsOwned);
Picture.pre('remove', removeAllOwnedImages);

////
// Score
////

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
, scores: [Score]
, times:  [Time]
});

Competition.pre('remove', function (next) {
  this.scores.remove();
  this.times.remove();
  next();
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
});

Section.pre('save', removePreviouslyOwnedImages);
Section.pre('save', markImageAsOwned);
Section.pre('remove', removeAllOwnedImages);

Section.pre('remove', function (next) {
  this.times.remove();
  this.scores.remove();
  next();
});

Section.virtual('imageurl').get(function () {
  return '/resources/' + this.image;
});

////
// Ad
////

var Ad = new Schema({
  name:  { type: String, index: true }
, image: { type: ObjectId, ref: 'ImageData' }
});

Ad.pre('save', removePreviouslyOwnedImages);
Ad.pre('save', markImageAsOwned);
Ad.pre('remove', removeAllOwnedImages);

////
// Slideshow
////

var Slideshow = new Schema({
  name:   { type: String, index: true }
, images: [ImageData]
});

Slideshow.pre('remove', function (next) {
  this.images.remove(next);
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

module.exports = db;
