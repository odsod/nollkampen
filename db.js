var
  log = require('winston').cli(),
  mongoose = require('mongoose'),
  db = mongoose.createConnection('localhost', 'nollkampen');

var
  pictureSchema = new mongoose.Schema({
    name: String,
    imageUrl: String
  }),
  Picture = db.model('Picture', pictureSchema);

var
  competitionSchema = new mongoose.Schema({
    name: String
  }),
  Competition = db.model('Competition', competitionSchema);

var
  sectionSchema = new mongoose.Schema({
    name: String,
    initials: String,
    color: String,
    textColor: String,
    saintImageUrl: String
  }),
  Section = db.model('Section', sectionSchema);

var
  scoreSchema = new mongoose.Schema({
    section: mongoose.Schema.ObjectId,
    competition: mongoose.Schema.ObjectId,
    points: Number
  }),
  Score = db.model('Score', scoreSchema);

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
  Score: Score
};
