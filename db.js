var
  log = require('winston').cli(),
  mongoose = require('mongoose'),
  _ = require('underscore'),
  db = mongoose.createConnection('localhost', 'nollkampen');

var
  pictureSchema = new mongoose.Schema({
    name: String,
    imageUrl: String
  }),
  Picture = db.model('Picture', pictureSchema);

var
  scoreSchema = new mongoose.Schema({
    section: mongoose.Schema.ObjectId,
    competition: mongoose.Schema.ObjectId,
    points: Number
  });
  scoreSchema.post('save', function (next) {
    next();
  });
var
  Score = db.model('Score', scoreSchema);

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
var 
  Time = db.model('Time', timeSchema);

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
var
  Competition = db.model('Competition', competitionSchema);

var
  sectionSchema = new mongoose.Schema({
    name: String,
    initials: String,
    color: String,
    textColor: String,
    saintImageUrl: String,
  });
  sectionSchema.statics.findWithResults = function (cb) {
    var ret = [];
    this.find(function(err, sections) {
      Competition.find(function(err, competitions) {
        Time.find(function (err, times) {
          Score.find(function (err, scores) {
            sections.forEach(function (section) {
              var results = [];
              var total = 0;
              competitions.forEach(function (competition) {
                var 
                  time = _.filter(times, function (time) {
                    return time.section == section.id && time.competition == competition.id;
                  }),
                  points = _.filter(scores, function (score) {
                    return score.section == section.id && score.competition == competition.id;
                  });
              var
                  result = {
                    competition: competition.id,
                    time: time,
                    points: points
                  };
                results.push(result);
                total += result.points;
              });
              ret.results = results;
              ret.total = total;
            });
            cb(sections);
          });
        });
      });
    });
  },
  sectionSchema.pre('remove', function (next, section) {
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
var
  Section = db.model('Section', sectionSchema);

var
  adSchema = new mongoose.Schema({
    name: String,
    imageUrl: String
  }),
  Ad = db.model('Ad', adSchema);

module.exports = {
  Competition: Competition,
  Section: Section,
  Picture: Picture,
  Ad: Ad,
  Score: Score,
  Time: Time
};
