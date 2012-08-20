var
  log = require('winston').cli(),
  mongoose = require('mongoose'),
  _ = require('underscore'),
  db = mongoose.createConnection('localhost', 'nollkampen');

function moveToUploads(image) {
  var
    name = image.path.split('/').pop() + image.name,
    url = '/uploads/' + name;
  fs.renameSync(image.path, __dirname + '/public' + url);
  return url;
}

////
// Picture
////
var
  pictureSchema = new mongoose.Schema({
    caption: String,
    imageUrl: String
  });
  pictureSchema.pre('save', function (next, picture) {
    if (picture.imageUrl) {
      picture.imageUrl = moveToUploads(picture.imageUrl)
    }    
    next();
  });
  pictureSchema.pre('remove', function (next, picture) {
    fs.unlinkSync(__dirname + '/public' + section.saintImageUrl);
  });
exports.Picture = db.model('Picture', pictureSchema);

////
// Score
////
var
  scoreSchema = new mongoose.Schema({
    section: mongoose.Schema.ObjectId,
    competition: mongoose.Schema.ObjectId,
    points: Number
  });
  scoreSchema.post('save', function (next) {
    next();
  });
exports.Score = db.model('Score', scoreSchema);

////
// Time
////
var
  timeSchema = new mongoose.Schema({
    section: mongoose.Schema.ObjectId,
    competition: mongoose.Schema.ObjectId,
    minutes: Number,
    seconds: Number,
    disqualified: Boolean
  });
  timeSchema.virtual('text').get(function () {
    var
      paddedSeconds = this.seconds < 10 ? '0' : '' + this.seconds;
    return this.disqualified ? 'DISKAD' : this.minutes + ' : ' + paddedSeconds;
  });
exports.Time = db.model('Time', timeSchema);

////
// Competition
////
var
  competitionSchema = new mongoose.Schema({
    name: String
  });
  competitionSchema.pre('remove', function (next, competition) {
    Score.find({
      competition: competition.id
    }, function (err, scores) {
      scores.remove();    
    });
    Time.find({
      competition: competition.id 
    }, function (err, times) {
      times.remove();
    });
    next();
  });
exports.Competition = db.model('Competition', competitionSchema);

////
// Section
////
var
  sectionSchema = new mongoose.Schema({
    name: String,
    initials: String,
    color: String,
    textColor: String,
    alternateTextColor: String,
    saintImageUrl: String,
  });
  sectionSchema.pre('remove', function (next, section) {
    fs.unlinkSync(__dirname + '/public' + section.saintImageUrl);
    Score.find({
      section: section.id
    }, function (err, scores) {
      scores.remove();    
    });
    Time.find({
      section: section.id 
    }, function (err, times) {
      times.remove();
    });
    next();
  });
exports.Section = db.model('Section', sectionSchema);

////
// Ad
////
var
  adSchema = new mongoose.Schema({
    name: String,
    imageUrl: String
  });
exports.Ad = db.model('Ad', adSchema);
