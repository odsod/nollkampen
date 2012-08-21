var
  db = require('./db'),
  fs = require('fs'),
  log = require('winston').cli();

function saveImage(image) {
  var
    name = image.path.split('/').pop() + image.name,
    url = '/uploads/' + name;
  fs.renameSync(image.path, __dirname + '/public' + url);
  return url;
}

exports.index = function (req, res) {
  res.render('index', {
    title: 'Nollkampen',
    id: 'menu'
  });
};

////
// Screen
////

exports.screen = function (req, res) {
  res.render('screen');  
};

////
// Sections
////

exports.listSections = function (req, res) {
  res.render('sections/list', {
    title: 'Sektioner',
    id: 'section-list',
    back: '/',
    sections: req.sections
  });
};

exports.newSection = function (req, res) {
  res.render('sections/form', {
    title: 'Skapa ny sektion',
    id: 'section-form',
    formAction: '/sections',
    back: '/sections',
    section: {}
  });
};

exports.editSection = function (req, res) {
  res.render('sections/form', {
    title: 'Modifiera sektion',
    id: 'section-form',
    formAction: '/sections/' + req.section.id + '/update',
    back: '/sections',
    section: req.section
  });
};

exports.createSection = function (req, res) {
  var saintImageUrl;
  if (req.files && req.files.saintImage) {
    saintImageUrl = saveImage(req.files.saintImage);
  }
  new db.Section({
    name: req.body.name,
    initials: req.body.initials,
    color: req.body.color,
    textColor: req.body.textColor,
    alternateTextColor: req.body.alternateTextColor,
    saintImageUrl: saintImageUrl
  }).save(function (err, section) {
    if (err) log.error(err.toString());
    res.redirect('/sections');
  });
};

exports.updateSection = function (req, res) {
  var newSaintImageUrl;
  if (req.files && req.files.saintImage) {
    newSaintImageUrl = saveImage(req.files.saintImage);
    if (req.section.saintImageUrl) {
      deleteImage(req.section.saintImageUrl);
    }
  } else {
    newSaintImageUrl = req.section.saintImageUrl;
  }
  req.section.update({
    name: req.body.name,
    initials: req.body.initials,
    color: req.body.color,
    textColor: req.body.textColor,
    alternateTextColor: req.body.alternateTextColor,
    saintImageUrl: newSaintImageUrl
  }, function (err) {
    if (err) log.error(err.toString());
    res.redirect('/sections');
  });
};

exports.deleteSection = function (req, res) {
  if (req.section.saintImageUrl) {
    deleteImage(req.section.saintImageUrl);
  }
  req.section.remove();
  res.redirect('/sections');
};

////
// Competitions
////

exports.listCompetitions = function (req, res) {
  res.render('competitions/list', {
    title: 'Grenar',
    id: 'competitions-list',
    back: '/',
    competitions: req.competitions
  });
};

exports.newCompetition = function (req, res) {
  res.render('competitions/form', {
    title: 'Skapa ny gren',
    id: 'competition-form',
    formAction: '/competitions',
    back: '/competitions',
    competition: {}
  });
};

exports.editCompetition = function (req, res) {
  res.render('competitions/form', {
    title: 'Modifiera gren',
    id: 'competition-form',
    formAction: '/competitions/' + req.competition.id + '/update',
    back: '/competitions',
    competition: req.competition
  });
};

exports.createCompetition = function (req, res) {
  new db.Competition({
    name: req.body.name
  }).save(function (err) {
    if (err) log.error(err.toString());
    res.redirect('/competitions');
  });
};

exports.deleteCompetition = function (req, res) {
  db.Time.find({
    competition: req.competition.id
  }, function (err, times) {
    times.forEach(function (time) {
      time.remove();
    });
  });
  db.Score.find({
    competition: req.competition.id
  }, function (err, scores) {
    scores.forEach(function (score) {
      score.remove();
    });
  });
  req.competition.remove();
  res.redirect('/competitions');
};

exports.updateCompetition = function (req, res) {
  req.competition.update({
    name: req.body.name
  }, function (err) {
    if (err) log.error(err.toString());
    res.redirect('/competitions');
  });
};

////
// Ads
////

exports.listAds = function (req, res) {
  res.render('ads/list', {
    title: 'Annonser',
    id: 'ads-list',
    back: '/',
    ads: req.ads
  });
};

exports.newAd = function (req, res) {
  res.render('ads/form', {
    title: 'Skapa ny annons',
    id: 'ad-form',
    formAction: '/ads',
    back: '/ads',
    ad: {}
  });
};

exports.editAd = function (req, res) {
  res.render('ads/form', {
    title: 'Modifiera annons',
    id: 'ad-form',
    formAction: '/ads/' + req.ad.id + '/update',
    back: '/ads',
    ad: req.ad
  });
};

exports.createAd = function (req, res) {
  var imageUrl;
  if (req.files && req.files.image) {
    imageUrl = saveImage(req.files.image);
  }
  new db.Ad({
    name: req.body.name,
    imageUrl: imageUrl
  }).save(function (err) {
    res.redirect('/ads');
  });
};

exports.deleteAd = function (req, res) {
  req.ad.remove();
  res.redirect('/ads');
};

exports.updateAd = function (req, res) {
  var newImageUrl;
  if (req.files && req.files.image) {
    newImageUrl = saveImage(req.files.image);
    if (req.ad.imageUrl) {
      deleteImage(req.ad.imageUrl);
    }
  } else {
    newImageUrl = req.ad.imageUrl;
  }
  req.ad.update({
    name: req.body.name,
    imageUrl: newImageUrl
  }, function (err) {
    if (err) log.error(err);
    res.redirect('/ads');
  });
};

////
// Pictures
////

exports.listPictures = function (req, res) {
  res.render('pictures/list', {
    title: 'Bilder',
    id: 'pictures-list',
    back: '/',
    pictures: req.pictures
  });
};

exports.newPicture = function (req, res) {
  res.render('pictures/form', {
    title: 'Ladda upp bilder',
    id: 'picture-form',
    formAction: '/pictures',
    back: '/pictures',
    picture: {}
  });
};

exports.createPicture = function (req, res) {
  if (req.files && req.files.images) {
    var numSaved = 0;
    req.files.images.forEach(function (image) {
      var imageUrl = saveImage(image);
      new db.Picture({
        name: image.name.split('.')[0],
        imageUrl: imageUrl
      }).save(function (err) {
        if (err) log.error(err);
        numSaved += 1;
        if (numSaved === req.files.images.length) {
          res.redirect('/pictures');
        }
      });
    });
  } else {
    res.redirect('/pictures');
  }
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
    back: '/',
    competitions: req.competitions,
    sections: req.sections,
    scores: scoreTable
  });
};

exports.showCompetitionScores = function (req, res) {
  db.Score.find({
    competition: req.competition.id
  }, function (err, scores) {
    if (err) log.debug(err.toString());
    var sectionScores = {};
    scores.forEach(function (score) {
      sectionScores[score.section] = score.points;
    });
    res.render('scores/form', {
      title: req.competition.name,
      id: 'scores-form',
      back: '/scores',
      competition: req.competition,
      competitions: req.competitions,
      sections: req.sections,
      scores: sectionScores
    });
  });
};

exports.updateCompetitionScores = function (req, res) {
  req.sections.forEach(function (section) {
    db.Score.findOneAndUpdate({
      section: section.id,
      competition: req.competition.id
    }, {
      points: req.body[section.id]
    }, {
      upsert: true
    }, function (err) {
      if (err) log.debug(err.toString());
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
    back: '/',
    competitions: req.competitions,
    sections: req.sections,
    times: timeTable
  });
};

exports.showCompetitionTimes = function (req, res) {
  db.Time.find({
    competition: req.competition.id
  }, function (err, times) {
    if (err) log.error(err.toString());
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
      back: '/times',
      competition: req.competition,
      competitions: req.competitions,
      sections: req.sections,
      times: sectionTimes
    });
  });
};

exports.updateCompetitionTimes = function (req, res) {
  req.sections.forEach(function (section) {
    db.Time.findOneAndUpdate({
      section: section.id,
      competition: req.competition.id
    }, {
      minutes: req.body[section.id].minutes || 0,
      seconds: req.body[section.id].seconds || 0,
      disqualified: req.body[section.id].disqualified === 'true'
    }, {
      upsert: true
    }, function (err) {
      if (err) log.debug(err.toString());
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
    back: '/',
    sequences: req.sequences
  });
};

exports.newSequence = function (req, res) {
  res.render('sequences/form', {
    title: 'Skapa sekvens',
    id: 'sequence-form',
    formAction: '/sequences',
    back: '/sequences',
    sequence: {
      actions: []
    }
  });
};

exports.editSequence = function (req, res) {
  res.render('sequences/form', {
    title: 'Skapa sekvens',
    id: 'sequence-form',
    formAction: '/sequences/' + req.sequence.id + '/update',
    back: '/sequences',
    sequence: req.sequence
  });
};

exports.createSequence = function (req, res) {
  new db.Sequence({
    name: req.body.name,
    actions: req.body.actions
  }).save(function (err) {
    if (err) log.error(err.toString());
  });
  res.redirect('/sequences');
};

exports.updateSequence = function (req, res) {
  req.sequence.update({
    name: req.body.name,
    actions: req.body.actions
  }, function (err) {
    if (err) log.error(err.toString());
  });
  res.redirect('/sequences');
};

exports.deleteSequence = function (req, res) {
  req.sequence.remove();
  res.redirect('/sequences');
};

exports.listShowableSequences  = function (req, res) {
  res.render('sequences/show-list', {
    title: 'Visa sekvens',
    id: 'sequence-show-list',
    back: '/',
    sequences: req.sequences
  });
};

exports.showSequence  = function (req, res) {
  res.render('sequences/show', {
    id: 'sequence-show',
    title: 'Visar: ' + req.sequence.name,
    back: '/sequences/show-list',
    sequence: req.sequence
  });
};
