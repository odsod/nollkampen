var mongoose = require('mongoose');

module.exports = {
  Section:     mongoose.model('Section',     require('./section'))
, Competition: mongoose.model('Competition', require('./competition'))
, Result:      mongoose.model('Result',      require('./result'))
, Ad:          mongoose.model('Ad',          require('./ad'))
, Picture:     mongoose.model('Picture',     require('./picture'))
, Sequence:    mongoose.model('Sequence',    require('./sequence'))
, Slideshow:   mongoose.model('Slideshow',   require('./slideshow'))
};
