var db = require('./db')
  , log = require('./logs').app;

////
// Error handler
////

function handleError(err) {
  if (err) {
    log.error(err);
  }
}

////
// Images
////

exports.sendImage = function (req, res) {
  res.contentType(req.image.mime);
  res.send(req.image.data);
};

////
// Screen
////

exports.screen = function (req, res) {
  res.render('screen');
};

////
// Index menu
////

exports.index = function (req, res) {
  res.render('index', {
    title: 'Nollkampen',
    id:    'menu'
  });
};

////
// Sections
////

exports.listSections = function (req, res) {
  log.data(req.Section.instances);
  res.render('sections/list', {
    title:    'Sektioner',
    id:       'section-list',
    sections: req.Section.instances
  });
};

exports.newSection = function (req, res) {
  res.render('sections/form', {
    action:  '/sections',
    title:   'Skapa ny sektion',
    id:      'section-form',
    section: {}
  });
};

exports.editSection = function (req, res) {
  res.render('sections/form', {
    action:  '/sections/' + req.section.id + '/update',
    title:   'Modifiera sektion',
    id:      'section-form',
    section: req.section
  });
};

exports.createSection = function (req, res) {
  // Create image first
  var ImageData = db.model('ImageData');
  var image = new ImageData();
  if (req.files && req.files.image) {
    image.file = req.files.image;
  }
  image.save(function (err, image) {
    if (err) {
      log.error(err);
    }
    log.data(image);
    db.model('Section').create({
      name:               req.body.name,
      initials:           req.body.initials,
      color:              req.body.color,
      textColor:          req.body.textColor,
      alternateTextColor: req.body.alternateTextColor,
      image:              image && image._id
    }, function (err) {
      if (err) {
        log.error(err);
      }
    });
  });
  res.redirect('/sections');
};

exports.updateSection = function (req, res) {
  var image = new db.model('ImageData')();
  if (req.body.files && req.body.files.image) {
    image.file = req.body.files && req.body.files.image;
  }
  image.save(function (err, image) {
    req.section.update({
      name:               req.body.name
    , initials:           req.body.initials
    , color:              req.body.color
    , textColor:          req.body.textColor
    , alternateTextColor: req.body.alternateTextColor
    , image:              (!err && image && image._id) || req.section.image
    });
  });
};

exports.deleteSection = function (req, res) {
  req.section.remove();
  res.redirect('/sections');
};

////
// Competitions
////

exports.listCompetitions = function (req, res) {
  res.render('competitions/list', {
    title:        'Grenar',
    id:           'competitions-list',
    competitions: req.Competition.instances
  });
};

exports.newCompetition = function (req, res) {
  res.render('competitions/form', {
    title:       'Skapa ny gren',
    id:          'competition-form',
    action:      '/competitions',
    competition: {}
  });
};

exports.editCompetition = function (req, res) {
  res.render('competitions/form', {
    title:       'Modifiera gren',
    id:          'competition-form',
    action:      '/competitions/' + req.competition.id + '/update',
    competition: req.competition
  });
};

exports.createCompetition = function (req, res) {
  db.model('Competition').create({
    name: req.body.name
  });
  res.redirect('/competitions');
};

exports.deleteCompetition = function (req, res) {
  req.competition.remove();
  res.redirect('/competitions');
};

exports.updateCompetition = function (req, res) {
  req.competition.update({
    name: req.body.name
  });
  res.redirect('/competitions');
};

////
// Ads
////

exports.listAds = function (req, res) {
  res.render('ads/list', {
    title: 'Annonser',
    id:    'ads-list',
    ads:   req.Ad.instances
  });
};

exports.newAd = function (req, res) {
  res.render('ads/form', {
    title:  'Skapa ny annons',
    id:     'ad-form',
    action: '/ads',
    ad:     {}
  });
};

exports.editAd = function (req, res) {
  res.render('ads/form', {
    title:  'Modifiera annons',
    id:     'ad-form',
    action: '/ads/' + req.ad.id + '/update',
    ad:     req.ad
  });
};

exports.createAd = function (req, res) {
  // Create image first
  var image = new db.model('ImageData')();
  if (req.body.files && req.body.files.image) {
    image.file = req.body.files && req.body.files.image;
  }
  image.save(function (err, image) {
    db.model('Ad').create({
      name:  req.body.name,
      image: image && image._id
    });
  });
  res.redirect('/ads');
};

exports.deleteAd = function (req, res) {
  req.ad.remove();
  res.redirect('/ads');
};

////
// Pictures
////

exports.listPictures = function (req, res) {
  res.render('pictures/list', {
    title:    'Bilder',
    id:       'pictures-list',
    pictures: req.Picture.instances
  });
};

exports.newPicture = function (req, res) {
  res.render('pictures/form', {
    title:   'Ladda upp bilder',
    id:      'picture-form',
    action:  '/pictures',
    picture: {}
  });
};

exports.createPicture = function (req, res) {
  // Create picture
  var image = new db.model('ImageData')();
  if (req.body.files && req.body.files.image) {
    image.file = req.body.files && req.body.files.image;
  }
  image.save(function (err, image) {
    db.model('Picture').create({
      name:  req.body.name,
      caption:  req.body.caption,
      image: image && image._id
    });
  });
  res.redirect('/pictures');
};

exports.deletePicture = function (req, res) {
  req.picture.remove();
  res.redirect('/pictures');
};

////
// Scores
////

exports.showScoreTable = function (req, res) {
  var scoreTable = {};
  req.competitions.forEach(function (competition) {
    scoreTable[competition.id] = {};
  });
  req.scores.forEach(function (score) {
    scoreTable[score.competition][score.section] = score.points;
    scoreTable[score.section] = scoreTable[score.section] + score.points || score.points;
  });
  res.render('scores/table', {
    title: 'Poängställning',
    id: 'scores',
    competitions: req.competitions,
    sections: req.sections,
    scores: scoreTable
  });
};

exports.showCompetitionScores = function (req, res) {
  db.model('Score').find({
    competition: req.competition.id
  }, function (err, scores) {
    if (err) {
      log.debug(err.toString());
    }
    var sectionScores = {};
    scores.forEach(function (score) {
      sectionScores[score.section] = score.points;
    });
    res.render('scores/form', {
      title: req.competition.name,
      id: 'scores-form',
      competition: req.competition,
      competitions: req.competitions,
      sections: req.sections,
      scores: sectionScores
    });
  });
};

exports.updateCompetitionScores = function (req, res) {
  req.sections.forEach(function (section) {
    db.model('Score').findOneAndUpdate({
      section: section.id,
      competition: req.competition.id
    }, {
      points: req.body[section.id]
    }, {
      upsert: true
    });
  });
  res.redirect('/scores');
};

////
// Times
////

exports.showTimeTable = function (req, res) {
  var timeTable = {};
  req.competitions.forEach(function (competition) {
    timeTable[competition.id] = {};
  });
  req.times.forEach(function (time) {
    if (time.disqualified) {
      timeTable[time.competition][time.section] = 'Diskad';
    } else {
      timeTable[time.competition][time.section] =
        time.minutes + 'm ' + time.seconds + 's';
    }
  });
  res.render('times/table', {
    title: 'Tider',
    id: 'times-table',
    competitions: req.competitions,
    sections: req.sections,
    times: timeTable
  });
};

exports.showCompetitionTimes = function (req, res) {
  db.model('Time').find({
    competition: req.competition.id
  }, function (err, times) {
    if (err) {
      log.error(err.toString());
    }
    var sectionTimes = {};
    times.forEach(function (time) {
      sectionTimes[time.section] = {
        minutes: time.minutes,
        seconds: time.seconds,
        disqualified: time.disqualified
      };
    });
    log.debug(JSON.stringify(sectionTimes, '', '  '));
    res.render('times/form', {
      title: req.competition.name,
      id: 'times-form',
      competition: req.competition,
      competitions: req.competitions,
      sections: req.sections,
      times: sectionTimes
    });
  });
};

exports.updateCompetitionTimes = function (req, res) {
  req.sections.forEach(function (section) {
    db.model('Time').findOneAndUpdate({
      section: section.id,
      competition: req.competition.id
    }, {
      minutes: req.body[section.id].minutes || 0,
      seconds: req.body[section.id].seconds || 0,
      disqualified: req.body[section.id].disqualified === 'true'
    }, {
      upsert: true
    });
  });
  res.redirect('/times');
};

////
// Sequences
////

exports.listSequences = function (req, res) {
  res.render('sequences/list', {
    title: 'Sekvenser',
    id: 'sequence-list',
    sequences: req.Sequence.instances
  });
};

exports.newSequence = function (req, res) {
  res.render('sequences/form', {
    title:     'Skapa sekvens',
    id:        'sequence-form',
    action:    '/sequences',
    sequence:  {
      actions: []
    }
  });
};

exports.editSequence = function (req, res) {
  res.render('sequences/form', {
    title:    'Skapa sekvens',
    id:       'sequence-form',
    action:   '/sequences/' + req.sequence.id + '/update',
    sequence: req.sequence
  });
};

exports.createSequence = function (req, res) {
  db.model('Sequence').create({
    name:    req.body.name,
    actions: req.body.actions
  });
  res.redirect('/sequences');
};

exports.updateSequence = function (req, res) {
  req.sequence.update({
    name:    req.body.name,
    actions: req.body.actions
  });
  res.redirect('/sequences');
};

exports.deleteSequence = function (req, res) {
  req.sequence.remove();
  res.redirect('/sequences');
};

exports.listShowableSequences  = function (req, res) {
  res.render('sequences/show-list', {
    title:     'Visa sekvens',
    id:        'sequence-show-list',
    sequences: req.Sequence.instances
  });
};

exports.showSequence  = function (req, res) {
  res.render('sequences/show', {
    id:       'sequence-show',
    title:    'Visar: ' + req.sequence.name,
    sequence: req.sequence
  });
};
