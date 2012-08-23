var db = require('./db')
  , _ = require('underscore')
  , Section = db.model('Section')
  , Competition = db.model('Competition')
  , Time = db.model('Time')
  , Score = db.model('Score')
  , Ad = db.model('Ad')
  , Picture = db.model('Picture')
  , Sequence = db.model('Sequence')
  , Slideshow = db.model('Slideshow')
  , ImageData = db.model('ImageData')
  , log = require('./logs').app;

////
// Error handler
////

function handleError(err) {
  if (err) {
    log.error(err.stack);
  }
}

////
// I dont know what the fuck yet
////

var metadata = {
  'Section': {
    root: '/sections'
  , modelName: 'Sektion'
  , modelNamePlural: 'Sektioner'
  , showables: {
      title:    'initials'
    , subtitle: 'name'
    , link:     'initials'
    }
  , templates: {
      form: 'sections/form'
    }
  }
, 'Competition': {
    root: '/competitions'
  , modelName: 'Gren'
  , modelNamePlural: 'Grenar'
  , showables: {
      title:    'name'
    , subtitle: 'name'
    , link:     'name'
    }
  , templates: {
      form: 'competitions/form'
    }
  }
, 'Ad': {
    root: '/ads'
  , modelName: 'Annons'
  , modelNamePlural: 'Annonser'
  , showables: {
      title:    'name'
    , subtitle: 'name'
    , link:     'name'
    }
  , templates: {
      form: 'ads/form'
    }
  }
, 'Picture': {
    root: '/pictures'
  , modelName: 'Bild'
  , modelNamePlural: 'Bilder'
  , showables: {
      title:    'name'
    , subtitle: 'name'
    , link:     'name'
    }
  , templates: {
      form: 'pictures/form'
    }
  }
};

exports.list = function (model) {
  return function (req, res) {
    res.render('list', _.extend(metadata[model], {
      instances: req[model].instances
    }));
  };
};

exports.new = function (model) {
  return function (req, res) {
    res.render(metadata[model].templates.form, _.extend(metadata[model], {
      title: 'Skapa'
    , postTo: metadata[model].root
    , instance: {}
    }));
  };
};

exports.edit = function (model) {
  return function (req, res) {
    res.render(metadata[model].templates.form, _.extend(metadata[model], {
      title: 'Editera'
    , postTo: metadata[model].root + '/' + req[model].instance[metadata[model].showables.link] + '/update'
    , instance: req[model].instance
    }));
  };
};

exports.delete = function (model) {
  return function (req, res) {
    db.model(model)
      .findByIdAndRemove(req[model].instance._id, function (err) {
        handleError(err);
        res.redirect(metadata[model].root);
      });
  };
};

////
// Images
////

exports.sendImageData = function (req, res) {
  res.contentType(req.ImageData.instance.mime);
  res.send(req.ImageData.instance.data);
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
  res.render('index');
};

////
// Sections
////

exports.upsertSection = function (req, res) {
  var section = (req.Section && req.Section.instance) || new Section();
  // First insert image into db if it was uploaded
  section.setImageData(req.files.image, function (section) {
    section.name = req.body.name;
    section.initials = req.body.initials;
    section.color = req.body.color;
    section.textColor = req.body.textColor;
    section.alternateTextColor = req.body.alternateTextColor;
    section.save(function (err) {
      handleError(err);
      res.redirect('/sections');
    });
  });
};

////
// Competitions
////

exports.upsertCompetition = function (req, res) {
  var competition = (req.Competition && req.Competition.instance) || new Competition();
  competition.name = req.body.name;
  competition.save(function (err) {
    handleError(err);
    res.redirect('/competitions');
  });
};

////
// Ads
////

exports.upsertAd = function (req, res) {
  var ad = (req.Ad && req.Ad.instance) || new Ad();
  ad.setImageData(req.files.image, function (ad) {
    ad.name = req.body.name;
    ad.save(function (err) {
      handleError(err);
      res.redirect('/ads');
    });
  });
};

////
// Pictures
////

exports.upsertPicture = function (req, res) {
  var picture = (req.Picture && req.Picture.instance) || new Picture();
  picture.setImageData(req.files.image, function (picture) {
    picture.name = req.body.name;
    res.redirect('/ads');
  });
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
    handleError(err);
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
    handleError(err);
    var sectionTimes = {};
    times.forEach(function (time) {
      sectionTimes[time.section] = {
        minutes: time.minutes,
        seconds: time.seconds,
        disqualified: time.disqualified
      };
    });
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

exports.upsertSequence = function (req, res) {
  // TODO
  // db.model('Sequence').create({
  //   name:    req.body.name,
  //   actions: req.body.actions
  // });
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
