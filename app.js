var
  express = require('express'),
  routes = require('./routes'),
  http = require('http'),
  path = require('path'),
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
  log.debug('param');
  req.competition = 'test';
  next();
});

app.get('/', routes.index);
app.get('/sections', routes.section);
app.get('/competitions', routes.competitions);
app.get('/competitions/:competition', routes.competition);

http.createServer(app).listen(app.get('port'), function () {
  log.info("Express server listening on port " + app.get('port'));
});
