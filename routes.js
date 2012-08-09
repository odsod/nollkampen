var
  db = require('./db'),
  fs = require('fs'),
  log = require('winston').cli();

function saveImage(path, filename) {
  var
    name = path.split('/').pop() + filename;
  fs.renameSync(path, __dirname + '/public/uploads/' + name);
  return name;
}

exports.index = function (req, res) {
  res.render('index', {
    title: 'Nollkampen',
    id: 'menu'
  });
};

exports.listSections = function (req, res) {
  db.Section.find(function (err, sections) {
    res.render('sections/list', {
      title: 'Sektioner',
      id: 'section-list',
      sections: sections
    });
  });
};

exports.newSection = function (req, res) {
  res.render('sections/new', {
    title: 'Skapa ny sektion',
    id: 'section-form',
    section: {}
  });
};

exports.editSection = function (req, res) {
  res.render('sections/edit', {
    title: 'Modifiera sektion',
    id: 'section-form',
    section: req.section
  });
};

exports.createSection = function (req, res) {
  log.debug('Files', req.files.saintImage);
  var
    saintImageUrl = saveImage(
      req.files.saintImage.path,
      req.files.saintImage.name
    );
  log.debug('saint', saintImageUrl);
  new db.Section({
    name: req.body.name,
    initials: req.body.initials,
    saintImageUrl: saintImageUrl
  }).save(function (err, section) {
    if (err) {
      log.debug(err.toString());
    } else {
      log.debug('heeelooooo', section.saintImageUrl);
      exports.listSections(req, res);
    }
  });
};

exports.updateSection = function (req, res) {
  req.section.update({
    name: req.body.name,
    initials: req.body.initials
  }, function (err) {
    exports.listSections(req, res);
  });
};

exports.deleteSection = function (req, res) {
  req.section.remove();
  exports.listSections(req, res);
};

exports.listCompetitions = function (req, res) {
  db.Competition.find(function (err, competitions) {
    res.render('competitions/list', {
      title: 'Grenar',
      id: 'competitions-list',
      competitions: competitions
    });
  });
};

exports.newCompetition = function (req, res) {
  res.render('competitions/new', {
    title: 'Skapa ny gren',
    id: 'competition-form',
    competition: {}
  });
};

exports.editCompetition = function (req, res) {
  res.render('competitions/edit', {
    title: 'Modifiera gren',
    id: 'competition-form',
    competition: req.competition
  });
};

exports.createCompetition = function (req, res) {
  log.debug('hej');
  new db.Competition({
    name: req.body.name
  }).save(function (err) {
    exports.listCompetitions(req, res);
  });
};

exports.deleteCompetition = function (req, res) {
  req.competition.remove();
  exports.listCompetitions(req, res);
};

exports.updateCompetition = function (req, res) {
  req.competition.update({
    name: req.body.name
  }, function (err) {
    exports.listCompetitions(req, res);
  });
};
