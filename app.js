/*jshint camelcase:false */

var express            = require('express')
  , app                = express()
  , ResourceController = require('./controllers/resource-controller')
  , ResultsController  = require('./controllers/results-controller')
  , ScreenController   = require('./controllers/screen-controller')
  , server             = require('http').createServer(app)
  , _                  = require('underscore')
  , path               = require('path')
  , db                 = require('./models')
  , connectHandlebars  = require('connect-handlebars')
  , logs               = require('./logs')
  , log                = logs.app;

// Config: All
app.configure(function () {
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  // Connect express logger to Winston
  app.use(express.logger({ stream: logs.expressStream }));
  app.use(express.bodyParser({
    // uploadDir: __dirname + '/public/uploads'
  }));
  app.use(express.methodOverride());
  app.use(app.router);
  // Compile stylus stylesheets
  app.use(require('stylus').middleware(__dirname + '/public'));
  // Precompile client-side templates
  app.use('/templates.js', connectHandlebars(__dirname + '/templates', {
    exts_re: /\.hbs$|\.handlebars$/,
    recursive: true,
    encoding: 'utf8'
  }));
  // Serve static files from public
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function () {
  app.use(express.errorHandler());
});

////
// Pamameter declarations
////

app.param(':param', function (req, res, next, param) {
  req.param = param;
  next();
});

////
// Top level routes
////

app.get('/', function (req, res) {
  res.render('index');
});

app.get('/screen', ScreenController.screen);

////
// Screen routes
////

ScreenController.listen(server);

app.get('/screen/instapic', ScreenController.showInstapic);
app.post('/screen/instapic', ScreenController.createInstapic);

app.get('/screen/sequences'
      , ResourceController.loadCollection('Sequence')
      , ScreenController.listSequences);

app.get('/screen/sequences/:param'
      , ResourceController.loadInstance('Sequence', 'param')
      , ScreenController.showSequence);

app.post('/screen', ScreenController.handleAction);

////
// Image server
////

app.get('/img', require('./models/has-image').createServer({ route: '/img' }));

////
// Upsert hook for saving images
////

function saveImageHook(req, instance) {
  instance.image = req.files.image;
}

////
// Resource routes
////

ResourceController.resource(app, '/sections', {
  model:           'Section'
, root:            '/sections'
, form:            'section-form'
, upsertHook:      saveImageHook
, locale:          {
    modelSingular: 'Sektion'
  , modelPlural:   'Sektioner'
  }
});

ResourceController.resource(app, '/competitions', {
  model:           'Competition'
, root:            '/competitions'
, form:            'competition-form'
, locale:          {
    modelSingular: 'Gren'
  , modelPlural:   'Grenar'
  }
});

ResourceController.resource(app, '/ads', {
  model:           'Ad'
, root:            '/ads'
, form:            'image-form'
, upsertHook:      saveImageHook
, locale:          {
    modelSingular: 'Annons'
  , modelPlural:   'Annonser'
  }
});

ResourceController.resource(app, '/pictures', {
  model:           'Picture'
, root:            '/pictures'
, form:            'picture-form'
, upsertHook:      saveImageHook
, locale:          {
    modelSingular: 'Bild'
  , modelPlural:   'Bilder'
  }
});

ResourceController.resource(app, '/sequences', {
  model:           'Sequence'
, root:            '/sequences'
, form:            'sequence-form'
, locale:          {
    modelSingular: 'Sekvens'
  , modelPlural:   'Sekvenser'
  }
});

////
// Results routes
////

app.get('/results/:param'
      , ResourceController.loadInstance('Competition', 'param')
      , ResourceController.loadCollection('Section')
      , ResourceController.loadCollection('Result')
      , ResultsController.edit);

app.get('/results'
      , ResultsController.loadTotals
      , ResourceController.loadCollection('Competition')
      , ResultsController.list);

app.put('/results/:param'
      , ResourceController.loadInstance('Competition', 'param')
      , ResultsController.update);

////
// ...and go
////

server.listen(app.get('port'), function () {
  logs.express.info('Express server listening on port ' + app.get('port'));
});
