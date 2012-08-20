var
  express = require('express'),
  app = express(),
  server = require('http').createServer(app),
  sockets = require('./sockets').listen(server);
  routes = require('./routes'),
  path = require('path'),
  _ = require('underscore'),
  db = require('./db'),
  connectHandlebars = require('connect-handlebars'),
  log = require('winston').cli();

app.configure(function () {
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser({
    uploadDir: __dirname + '/public/uploads'
  }));
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use('/templates.js', connectHandlebars(__dirname + '/templates', {
    exts_re: /.hbs$|.handlebars$/,
    recursive: true,
    encoding: 'utf8'
  }));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function () {
  app.use(express.errorHandler());
});

app.param('competition', function (req, res, next, id) {
  db.Competition.findById(id, function (err, competition) {
    req.competition = competition;
    next();
  });
});

app.param('section', function (req, res, next, id) {
  db.Section.findById(id, function (err, section) {
    req.section = section;
    next();
  });
});

app.param('ad', function (req, res, next, id) {
  db.Ad.findById(id, function (err, ad) {
    req.ad = ad;
    next();
  });
});

app.param('picture', function (req, res, next, id) {
  db.Picture.findById(id, function (err, picture) {
    req.picture = picture;
    next();
  });
});

function loadCompetition(req, res, next) {
  if (req.body.competition) {
    db.Competition.findById(req.body.competition, function (err, competition) {
      req.competition = competition;
      next();
    });
  } else {
    next();
  }
}

function loadModel(model, paramName, criteria) {
  return function (req, res, next) {
    model.find(function (err, instances) {
      if (err) {
        log.error(err);
        return res.send('Shit happened.');
      }
      req[paramName] = instances;
      next();
    });
  };
}

function calculateResults(req, res, next) {
  var 
    results = {},
    times = {};
    points = {};
  req.competitions.forEach(function (c) {
    results[c.id] = [];
    points[c.id] = {};
    times[c.id] = {};
  });
  req.sections.forEach(function (s) {
    results[s.id] = [];
    points[s.id] = 0;
    req.competitions.forEach(function (c) {
      // Record results for this competition on the section
      var p = _.find(req.scores, function (sc) {
          return sc.section == s.id && sc.competition == c.id;
      }).points;
      var t = _.find(req.times, function (t) {
        return t.section == s.id && t.competition == c.id;
      }).text;
      results[s.id].push({
        competition: c.id,
        points: p || null,
        time: t
      });
      points[c.id][s.id] = p;
      times[c.id][s.id] = t;
      results[c.id].push({
        section: s.id,
        initials: s.initials,
        points: p,
        time: t
      });
      points[s.id] += p;
    });
  });
  var places = {};
  var tally = [];
  req.sections.forEach(function (s) {
    tally.push({
      section: s.id,
      initials: s.initials,
      points: points[s.id]
    });
  });
  tally.sort(function (s1, s2) {
    return (s2.points - s1.points) || 
      (s1.initials == 'IT' && -1) || 
      (s2.initials == 'IT' && 1) || 
      (s1.initials.toLowerCase() > s2.initials.toLowerCase() && 1) ||
      (s1.initials.toLowerCase() < s2.initials.toLowerCase() && -1) || 
      0;
  });
  var currPlace = 0;
  var currTotal = Number.POSITIVE_INFINITY;
  tally.forEach(function (t) {
    if (t.points < currTotal) {
      currPlace += 1;
    }
    places[t.section] = currPlace;
    t.place = currPlace;
    currTotal = t.points;
  });
  // Assign competition places
  req.competitions.forEach(function (c) {
    places[c.id] = {};
    results[c.id].sort(function (s1, s2) {
      return (s2.points - s1.points) || 
         (s1.initials == 'IT' && -1) || 
         (s2.initials == 'IT' && 1) || 
         (s1.initials.toLowerCase() > s2.initials.toLowerCase() && 1) ||
         (s1.initials.toLowerCase() < s2.initials.toLowerCase() && -1) || 
         0;
    });
    var currPlace = 0;
    var currPoints = Number.POSITIVE_INFINITY;
    results[c.id].forEach(function (result) {
      if (result.points < currPoints) {
        currPlace += 1;
      }
      places[c.id][result.section] = currPlace; 
      result.place = currPlace;
      currPoints = result.points;
    });
  });
  req.results = results;
  req.points = points;
  req.places = places;
  req.tally = tally;
  req.times = times;
  next();
}

app.get('/', routes.index);
app.get('/screen', routes.screen);

// Sections CRUD
app.get('/sections', 
        loadModel(db.Section, 'sections'), 
        routes.listSections);
app.get('/sections/new', routes.newSection);
app.get('/sections/:section', routes.editSection);
app.post('/sections', routes.createSection);
app.post('/sections/:section/delete', routes.deleteSection);
app.post('/sections/:section/update', routes.updateSection);

// Competitions CRUD
app.get('/competitions', 
        loadModel(db.Competition, 'competitions'), 
        routes.listCompetitions);
app.get('/competitions/new', routes.newCompetition);
app.get('/competitions/:competition', routes.editCompetition);
app.post('/competitions', routes.createCompetition);
app.post('/competitions/:competition/update', routes.updateCompetition);
app.post('/competitions/:competition/delete', routes.deleteCompetition);

// Ads CRUD
app.get('/ads', 
        loadModel(db.Ad, 'ads'), 
        routes.listAds);
app.get('/ads/new', routes.newAd);
app.get('/ads/:ad', routes.editAd);
app.post('/ads', routes.createAd);
app.post('/ads/:ad/delete', routes.deleteAd);
app.post('/ads/:ad/update', routes.updateAd);

// Pictures CRUD
app.get('/pictures', 
        loadModel(db.Picture, 'pictures'), 
        routes.listPictures);
app.get('/pictures/new', routes.newPicture);
app.get('/pictures/:picture', routes.editPicture);
app.post('/pictures', routes.createPicture);
app.post('/pictures/:picture/delete', routes.deletePicture);

// Scores
app.get('/scores', 
        loadModel(db.Competition, 'competitions'), 
        loadModel(db.Section, 'sections'), 
        loadModel(db.Score, 'scores'), 
        routes.showScoreTable);
app.get('/scores/:competition', 
        loadModel(db.Competition, 'competitions'), 
        loadModel(db.Section, 'sections'), 
        routes.showCompetitionScores);
app.post('/scores/:competition', 
         loadModel(db.Section, 'sections'), 
         routes.updateCompetitionScores);

// Times
app.get('/times', 
        loadModel(db.Competition, 'competitions'), 
        loadModel(db.Section, 'sections'), 
        loadModel(db.Time, 'times'),
        routes.showTimeTable);
app.get('/times/:competition', 
        loadModel(db.Competition, 'competitions'), 
        loadModel(db.Section, 'sections'), 
        routes.showCompetitionTimes);
app.post('/times/:competition', 
         loadModel(db.Section, 'sections'), 
         routes.updateCompetitionTimes);

app.get('/sequences', routes.newSequence);
app.post('/sequences', routes.createSequence);

// Methods that map to websocket messages
app.post('/screen/scoreboard', 
         loadModel(db.Competition, 'competitions'),
         loadModel(db.Section, 'sections'),
         loadModel(db.Time, 'times'),
         loadModel(db.Score, 'scores'),
         loadModel(db.Ad, 'ads'),
         sockets.showScoreboard);
app.post('/screen/countdown', sockets.showCountdown); 
app.post('/screen/picture', sockets.showPicture);
app.post('/screen/text', sockets.showText);
app.post('/screen/clear', sockets.clear);

app.post('/screen',
         loadModel(db.Competition, 'competitions'),
         loadModel(db.Section, 'sections'),
         loadModel(db.Time, 'times'),
         loadModel(db.Score, 'scores'),
         loadModel(db.Ad, 'ads'),
         loadModel(db.Picture, 'pictures'),
         calculateResults,
         loadCompetition,
         sockets.handle);

server.listen(app.get('port'), function () {
  log.info("Express server listening on port " + app.get('port'));
});
