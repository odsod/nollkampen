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

function deleteImage(url) {
  fs.unlinkSync(__dirname + '/public' + url);
}

exports.index = function (req, res) {
  res.render('index', {
    title: 'Nollkampen',
    id: 'menu'
  });
};

////
// Sections
////

exports.listSections = function (req, res) {
  db.Section.find(function (err, sections) {
    res.render('sections/list', {
      title: 'Sektioner',
      id: 'section-list',
      back: '/',
      sections: sections
    });
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
  log.debug(JSON.stringify(req.files, '', '  '));
  if (req.files && req.files.saintImage) {
    saintImageUrl = saveImage(req.files.saintImage);
  }
  log.debug(saintImageUrl);
  new db.Section({
    name: req.body.name,
    initials: req.body.initials,
    color: req.body.color,
    textColor: req.body.textColor,
    saintImageUrl: saintImageUrl
  }).save(function (err, section) {
    if (err) {
      log.error(err.toString());
    } else {
      exports.listSections(req, res);
    }
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
    saintImageUrl: newSaintImageUrl
  }, function (err) {
    if (err) {
      log.error(err.toString());
    } else {
      exports.listSections(req, res);
    }
  });
};

exports.deleteSection = function (req, res) {
  if (req.section.saintImageUrl) {
    deleteImage(req.section.saintImageUrl);
  }
  req.section.remove();
  exports.listSections(req, res);
};

////
// Competitions
////

exports.listCompetitions = function (req, res) {
  db.Competition.find(function (err, competitions) {
    res.render('competitions/list', {
      title: 'Grenar',
      id: 'competitions-list',
      back: '/',
      competitions: competitions
    });
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

////
// Ads
////

exports.listAds = function (req, res) {
  db.Ad.find(function (err, ads) {
    res.render('ads/list', {
      title: 'Annonser',
      id: 'ads-list',
      back: '/',
      ads: ads
    });
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
    exports.listAds(req, res);
  });
};

exports.deleteAd = function (req, res) {
  req.ad.remove();
  exports.listAds(req, res);
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
    exports.listAds(req, res);
  });
};

////
// Pictures
////

exports.listPictures = function (req, res) {
  db.Picture.find(function (err, pictures) {
    res.render('pictures/list', {
      title: 'Bilder',
      id: 'pictures-list',
      back: '/',
      pictures: pictures
    });
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
  if (req.files.images) {
    var numSaved = 0;
    req.files.images.forEach(function (image) {
      var imageUrl = saveImage(image);
      new db.Picture({
        name: image.name.split('.')[0],
        imageUrl: imageUrl
      }).save(function (err) {
        numSaved += 1;
        if (numSaved === req.files.images.length) {
          exports.listPictures(req, res);
        }
      });
    });
  } else {
    exports.listPictures(req, res);
  }
};

exports.deletePicture = function (req, res) {
  req.picture.remove();
  exports.listPictures(req, res);
};

////
// Scores
////

exports.showScoreTable = function (req, res) {
  db.Competition.find(function (err, competitions) {
    db.Section.find(function (err, sections) {
      db.Score.find(function (err, scores) {
        var scoreTable = {};
        scores.forEach(function (score) {
          scoreTable[score.competition] = scoreTable[score.competition] || {};
          scoreTable[score.competition][score.section] = scoreTable[score.competition][score.section] || {};
          scoreTable[score.competition][score.section].points = score.points;
          scoreTable[score.section] = scoreTable[score.section] || {};
          scoreTable[score.section].total = scoreTable[score.section].total + score.points || score.points;
        });
        log.debug(JSON.stringify(scoreTable, '', '  '));
        res.render('scores/table', {
          title: 'Poängställning',
          id: 'scores',
          back: '/',
          competitions: competitions,
          sections: sections,
          scores: scoreTable
        });
      });
    });
  });
};


exports.showTimeTable = function (req, res) {
  db.Competition.find(function (err, competitions) {
    db.Section.find(function (err, sections) {
      db.Time.find(function (err, times) {
        log.debug(JSON.stringify(times, '', '  '));
        var timeTable = {};
        times.forEach(function (time) {
          timeTable[time.competition] = timeTable[time.competition] || {};
          timeTable[time.competition][time.section] = timeTable[time.competition][time.section] || {};
          timeTable[time.competition][time.section].minutes = time.minutes;
          timeTable[time.competition][time.section].seconds = time.seconds;
        });
        log.debug(JSON.stringify(timeTable, '', '  '));
        res.render('times/table', {
          title: 'Tider',
          id: 'times-table',
          back: '/',
          competitions: competitions,
          sections: sections,
          times: timeTable
        });
      });
    });
  });
};
exports.showCompetitionScores = function (req, res) {
  db.Section.find(function (err, sections) {
    db.Score
      .find({
        competition: req.competition.id
      })
      .exec(function (err, scores) {
        var sectionScores = {};
        scores.forEach(function (score) {
          sectionScores[score.section] = score.points;
        });
        db.Competition
          .find()
          .select('name')
          .exec(function (err, competitions) {
            res.render('scores/form', {
              title: req.competition.name,
              id: 'scores-form',
              back: '/scores',
              competition: req.competition,
              competitions: competitions,
              sections: sections,
              scores: sectionScores
            });
          });
      });
  });
};

exports.updateCompetitionScores = function (req, res) {
  db.Section.find(function (err, sections) {
    sections.forEach(function (section) {
      log.debug(section.id, { score: req.body[section.id] });
      db.Score
        .findOneAndUpdate({
          section: section.id,
          competition: req.competition.id
        }, {
          points: req.body[section.id]
        }, {
          upsert: true
        })
        .exec();
    });
  });
  exports.showScoreTable(req, res);
};

////
// Times
////

exports.showTimeTable = function (req, res) {
  db.Competition.find(function (err, competitions) {
    db.Section.find(function (err, sections) {
      db.Time.find(function (err, times) {
        log.debug(JSON.stringify(times, '', '  '));
        var timeTable = {};
        times.forEach(function (time) {
          timeTable[time.competition] = timeTable[time.competition] || {};
          timeTable[time.competition][time.section] = timeTable[time.competition][time.section] || {};
          timeTable[time.competition][time.section].minutes = time.minutes;
          timeTable[time.competition][time.section].seconds = time.seconds;
          timeTable[time.competition][time.section].disqualified = time.disqualified;
        });
        log.debug(JSON.stringify(timeTable, '', '  '));
        res.render('times/table', {
          title: 'Tider',
          id: 'times-table',
          back: '/',
          competitions: competitions,
          sections: sections,
          times: timeTable
        });
      });
    });
  });
};

exports.showCompetitionTimes = function (req, res) {
  db.Section.find(function (err, sections) {
    db.Time
      .find({
        competition: req.competition.id
      })
      .exec(function (err, times) {
        if (err) {
          log.error(err);
        }
        var sectionTimes = {};
        times.forEach(function (time) {
          sectionTimes[time.section] = {
            minutes: time.minutes,
            seconds: time.seconds
          };
        });
        db.Competition
          .find()
          .select('name')
          .exec(function (err, competitions) {
            if (err) {
              log.error(err);
            }
            log.debug(sectionTimes);
            res.render('times/form', {
              title: req.competition.name,
              id: 'times-form',
              back: '/times',
              competition: req.competition,
              competitions: competitions,
              sections: sections,
              times: sectionTimes
            });
          });
      });
  });
};

exports.updateCompetitionTimes = function (req, res) {
  db.Section.find(function (err, sections) {
    log.error(err);
    sections.forEach(function (section) {
      log.debug(section.id, { score: req.body[section.id] });
      db.Time
        .findOneAndUpdate({
          section: section.id,
          competition: req.competition.id
        }, {
          minutes: req.body[section.id].minutes,
          seconds: req.body[section.id].seconds,
          disqualified: req.body[section.id].disqualified === 'true'
        }, {
          upsert: true
        })
        .exec(function (err) {
          log.debug(err);
        });
    });
  });
  exports.showTimeTable(req, res);
};
