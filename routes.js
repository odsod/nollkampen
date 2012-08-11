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
  res.render('sections/new', {
    title: 'Skapa ny sektion',
    id: 'section-form',
    back: '/sections',
    section: {}
  });
};

exports.editSection = function (req, res) {
  res.render('sections/edit', {
    title: 'Modifiera sektion',
    id: 'section-form',
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
    saintImageUrl: saintImageUrl
  }).save(function (err, section) {
    if (err) {
      log.err(err.toString());
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
      log.err(err.toString());
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
  res.render('competitions/new', {
    title: 'Skapa ny gren',
    id: 'competition-form',
    back: '/competitions',
    competition: {}
  });
};

exports.editCompetition = function (req, res) {
  res.render('competitions/edit', {
    title: 'Modifiera gren',
    id: 'competition-form',
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
  res.render('ads/new', {
    title: 'Skapa ny annons',
    id: 'ad-form',
    back: '/ads',
    ad: {}
  });
};

exports.editAd = function (req, res) {
  res.render('ads/edit', {
    title: 'Modifiera annons',
    id: 'ad-form',
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
  res.render('pictures/new', {
    title: 'Ladda upp bilder',
    id: 'picture-form',
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

exports.showScores = function (req, res) {
  db.Competition.find(function (err, competitions) {
    res.render('scores/index', {
      title: 'Poängställning',
      id: 'scores',
      back: '/pictures',
      competitions: competitions
    });
  });
};
