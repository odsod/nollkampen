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
  log.debug(id);
  db.Competition.findById(id, function (err, competition) {
    req.competition = competition;
    next();
  });
});

app.get('/', routes.index);

app.get('/sections', routes.listSections);
app.get('/sections/:section', routes.editSection);

app.post('/competitions', routes.createCompetition);
app.delete('/competitions/:competition', routes.deleteCompetition);
app.put('/competitions/:competition', routes.updateCompetition);

app.get('/competitions', routes.listCompetitions);
app.get('/competitions/new', routes.newCompetition);
app.get('/competitions/:competition', routes.editCompetition);

http.createServer(app).listen(app.get('port'), function () {
  log.info("Express server listening on port " + app.get('port'));
});
