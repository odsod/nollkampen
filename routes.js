var
  log = require('winston').cli();

exports.index = function (req, res) {
  res.render('index', { title: 'Nollkampen' });
};

exports.section = function (req, res) {
  res.render('section', {
    title: 'Modifiera sektion',
    section: req.section
  });
};

exports.competition = function (req, res) {
  res.render('competition', {
    title: 'Modifiera tävling',
    competition: req.competition
  });
};

exports.competitions = function (req, res) {
  res.render('competitions-list', {
    title: 'Tävlingar',
    competitions: [{
      id: 1,
      name: 'Kombisäck'
    }, {
      id: 2,
      name: 'Skidstafett'
    }]
  });
};
