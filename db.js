var
  log = require('winston').cli(),
  mongoose = require('mongoose'),
  db = mongoose.createConnection('localhost', 'nollkampen');

var
  competitionSchema = new mongoose.Schema({
    name: String
  }),
  Competition = db.model('Competition', competitionSchema);

var
  sectionSchema = new mongoose.Schema({
    name: String,
    initials: String
  }),
  Section = db.model('Section', sectionSchema);

module.exports = {
  Competition: Competition,
  Section: Section
};
