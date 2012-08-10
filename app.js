var
  express = require('express'),
  routes = require('./routes'),
  http = require('http'),
  path = require('path'),
  db = require('./db'),
  log = require('winston').cli();

var app = express();

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

app.get('/', routes.index);

// Sections CRUD
app.post('/sections', routes.createSection);
app.post('/sections/:section/delete', routes.deleteSection);
app.post('/sections/:section/update', routes.updateSection);
app.get('/sections', routes.listSections);
app.get('/sections/new', routes.newSection);
app.get('/sections/:section', routes.editSection);

// Competitions CRUD
app.post('/competitions', routes.createCompetition);
app.post('/competitions/:competition/delete', routes.deleteCompetition);
app.post('/competitions/:competition/update', routes.updateCompetition);
app.get('/competitions', routes.listCompetitions);
app.get('/competitions/new', routes.newCompetition);
app.get('/competitions/:competition', routes.editCompetition);

// Ads CRUD
app.post('/ads', routes.createAd);
app.post('/ads/:ad/delete', routes.deleteAd);
app.post('/ads/:ad/update', routes.updateAd);
app.get('/ads', routes.listAds);
app.get('/ads/new', routes.newAd);
app.get('/ads/:ad', routes.editAd);

// Pictures CRUD
app.post('/pictures', routes.createPicture);
app.post('/pictures/:picture/delete', routes.deletePicture);
app.get('/pictures', routes.listPictures);
app.get('/pictures/new', routes.newPicture);
app.get('/pictures/:picture', routes.editPicture);

http.createServer(app).listen(app.get('port'), function () {
  log.info("Express server listening on port " + app.get('port'));
});
