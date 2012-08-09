var
  log = require('winston').cli(),
  mongoose = require('mongoose'),
  db = mongoose.createConnection('localhost', 'nollkampen');

var
  imageFileSchema = new mongoose.Schema({
    suffix: String,
    url: String
  }),
  ImageFile = db.model('ImageFile', imageFileSchema);

var
  competitionSchema = new mongoose.Schema({
    name: String
  }),
  Competition = db.model('Competition', competitionSchema);

var
  sectionSchema = new mongoose.Schema({
    name: String,
    initials: String,
    saintImageUrl: String
  }),
  Section = db.model('Section', sectionSchema);

module.exports = {
  Competition: Competition,
  Section: Section,
  ImageFile: ImageFile
};
