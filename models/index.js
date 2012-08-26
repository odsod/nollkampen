var mongoose = require('mongoose')
  , db = mongoose.createConnection('localhost', 'nollkampen');

module.exports = {
  Section:     db.model('Section',     require('./section'))
, Competition: db.model('Competition', require('./competition'))
, Result:      db.model('Result',      require('./result'))
, Ad:          db.model('Ad',          require('./ad'))
, Picture:     db.model('Picture',     require('./picture'))
, Sequence:    db.model('Sequence',    require('./sequence'))
, Slideshow:   db.model('Slideshow',   require('./slideshow'))
};
