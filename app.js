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
  app.use(express.bodyParser());
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

app.get('/', routes.index);

app.post('/sections', routes.createSection);
app.post('/sections/:section/delete', routes.deleteSection);
app.post('/sections/:section/update', routes.updateSection);
app.get('/sections', routes.listSections);
app.get('/sections/new', routes.newSection);
app.get('/sections/:section', routes.editSection);

app.post('/competitions', routes.createCompetition);
app.post('/competitions/:competition/delete', routes.deleteCompetition);
app.post('/competitions/:competition/update', routes.updateCompetition);
app.get('/competitions', routes.listCompetitions);
app.get('/competitions/new', routes.newCompetition);
app.get('/competitions/:competition', routes.editCompetition);

http.createServer(app).listen(app.get('port'), function () {
  log.info("Express server listening on port " + app.get('port'));
});
