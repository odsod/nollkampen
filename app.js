/*jshint camelcase:false */

var express            = require('express')
  , app                = express()
  , ResourceController = require('./controllers/resource-controller')
  , ResultsController  = require('./controllers/results-controller')
  , ScreenController   = require('./controllers/screen-controller')
  , server             = require('http').createServer(app)
  , _                  = require('underscore')
  , path               = require('path')
  , connectHandlebars  = require('connect-handlebars')
  , log                = require('./logs').app;

// Config: All
app.configure(function () {
  app.set('port', process.env.PORT || 3000);
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');
  app.use(express.favicon());
  // Connect express logger to Winston
  app.use(express.logger({ stream: require('./logs').expressStream }));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  // Precompile client-side templates
  app.use('/templates.js', connectHandlebars(path.join(__dirname, 'views', 'templates'), {
    exts_re: /\.hbs$|\.handlebars$/
  , recursive: true
  , encoding: 'utf8'
  }));
});

app.configure('development', function () {
  // Output errors
  app.use(express.errorHandler());
  // Force recompilation and do not compress styles
  app.use(require('stylus').middleware({
    force: true
  , compress: false
  , src:   path.join(__dirname, 'views')
  , dest:  path.join(__dirname, 'public')
  }));
});

app.configure('production', function () {
  // Compress stylesheets
  app.use(require('stylus').middleware({
    force: false
  , compress: true
  , src:   path.join(__dirname, 'stylesheets')
  , dest:  path.join(__dirname, 'public', 'stylesheets')
  }));
});

app.configure(function () {
  // Serve static files from public
  app.use(express.static(path.join(__dirname, 'public')));
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
// Resource routes
////

ResourceController.resource(app, '/sections', {
  model:           'Section'
, root:            '/sections'
, form:            'section-form'
, upsertHook:      ResourceController.saveImageHook
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
, upsertHook:      ResourceController.saveImageHook
, locale:          {
    modelSingular: 'Annons'
  , modelPlural:   'Annonser'
  }
});

ResourceController.resource(app, '/pictures', {
  model:           'Picture'
, root:            '/pictures'
, form:            'picture-form'
, upsertHook:      ResourceController.saveImageHook
, locale:          {
    modelSingular: 'Bild'
  , modelPlural:   'Bilder'
  }
});

ResourceController.resource(app, '/slideshows', {
  model:           'Slideshow'
, root:            '/slideshows'
, form:            'slideshow-form'
, upsertHook:      ResourceController.saveImagesHook
, locale:          {
    modelSingular: 'Bildspel'
  , modelPlural:   'Bildspel'
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
  require('./logs').express.info('Express server listening on port ' + app.get('port'));
});

log.debug('environment -', app.get('env'));
