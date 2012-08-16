var
  express = require('express'),
  app = express(),
  server = require('http').createServer(app),
  sockets = require('./sockets').listen(server);
  routes = require('./routes'),
  path = require('path'),
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

function loadModel(model, paramName, criteria) {
  return function (req, res, next) {
    model.find(function (err, instances) {
      if (err) {
        log.error(err);
        // The DangerZone(tm)
        return res.send('Shit happened.');
      }
      req[paramName] = instances;
      next();
    });
  };
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

// Methods that map to websocket messages
app.post('/screen/scoreboard', 
         loadModel(db.Competition, 'competitions'),
         loadModel(db.Section, 'sections'),
         loadModel(db.Time, 'times'),
         loadModel(db.Score, 'scores'),
         sockets.showScoreboard);
app.post('/screen/picture', sockets.showPicture);
app.post('/screen/text', sockets.showText);

server.listen(app.get('port'), function () {
  log.info("Express server listening on port " + app.get('port'));
});
