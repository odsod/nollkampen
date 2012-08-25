/*jshint camelcase:false */

var express           = require('express')
  , app               = express()
  , Controller        = require('./controller')
  , server            = require('http').createServer(app)
  , sockets           = require('./sockets').listen(server)
  , _                 = require('underscore')
  , path              = require('path')
  , db                = require('./db')
  , mongoose          = require('mongoose')
  , connectHandlebars = require('connect-handlebars')
  , logs              = require('./logs')
  , log               = logs.app;

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

app.get('/', function (req, res) {
  res.render('index');
});

////
// Parse :param into req.params
////

app.param(':param', function (req, res, next, param) {
  req.param = param;
  next();
});

app.get('/img/:param', function (req, res) {
  db[req.query.model]
    .findById(req.param)
    .select('imageData')
    .slice('imageData', req.query.i, 1)
    .exec(function (err, instance) {
      var image = instance.imageData.pop();
      res.contentType(image.mime);
      res.send(image.data);
    });
});

////
// Restful resource macro
////

function resource(root, controller) {

  ////
  // Index
  ////
  app.get(
    root
  , controller.loadCollection.bind(controller)
  , controller.index.bind(controller)
  );

  ////
  // New
  ////
  app.get(
    root + '/new'
    , controller.new.bind(controller)
  );

  ////
  // Edit
  ////
  app.get(
    root + '/:param'
    , controller.loadInstance.bind(controller)
    , controller.edit.bind(controller)
  );

  ////
  // Create
  ////
  app.post(
    root
  , controller.create.bind(controller)
  );

  ////
  // Update
  ////
  app.put(
    root + '/:param'
  , controller.loadInstance.bind(controller)
  , controller.update.bind(controller)
  );

  ////
  // Delete
  ////
  app.delete(
    root + '/:param'
  , controller.loadInstance.bind(controller)
  , controller.destroy.bind(controller)
  );
}

////
// Upsert hook for saving images
////

function saveImageHook(req, instance) {
  instance.image = req.files.image;
}

////
// Restful route declarations
////

resource('/sections', new Controller({
  model:           'Section'
, root:            '/sections'
, form:            'section-form'
, upsertHook:      saveImageHook
, locale:          {
    modelSingular: 'Sektion'
  , modelPlural:   'Sektioner'
  }
}));

resource('/competitions', new Controller({
  model:           'Competition'
, root:            '/competitions'
, form:            'competition-form'
, locale:          {
    modelSingular: 'Gren'
  , modelPlural:   'Grenar'
  }
}));

resource('/ads', new Controller({
  model:           'Ad'
, root:            '/ads'
, form:            'image-form'
, upsertHook:      saveImageHook
, locale:          {
    modelSingular: 'Annons'
  , modelPlural:   'Annonser'
  }
}));

resource('/pictures', new Controller({
  model:           'Picture'
, root:            '/pictures'
, form:            'picture-form'
, upsertHook:      saveImageHook
, locale:          {
    modelSingular: 'Bild'
  , modelPlural:   'Bilder'
  }
}));

resource('/sequences', new Controller({
  model:           'Sequence'
, root:            '/sequences'
, form:            'sequence-form'
, locale:          {
    modelSingular: 'Sekvens'
  , modelPlural:   'Sekvenser'
  }
}));

////
// Results
////

function loadCollection(model) {
  return function (req, res, next) {
    db[model].find(function (err, collection) {
      req[model] = { instances: collection };
      next();
    });
  };
}

function loadInstance(model, param) {
  return function (req, res, next) {
    db[model].findByAlias(req[param], function (err, instance) {
      req[model] = { instance: instance };
      next();
    });
  };
}

////
// Results editing
////

app.get('/results/:param'
      , loadInstance('Competition', 'param')
      , loadCollection('Section')
      , loadCollection('Result')
      , function (req, res) {
  res.render('result-form', {
    action: '/results/' + req.param
  , method: 'put'
  , title: 'Resultat för ' + req.Competition.instance.alias.toLowerCase()
  , sections: req.Section.instances
  , results: _.groupBy(req.Result.instances, 'section')
  , modelName: 'resultat'
  });
});

////
// Results overview
////

function loadTotals(req, res, next) {
  db.Result.compileTotal(function (results) {
    req.results = results;
    next();
  });
}

app.get('/results'
      , loadTotals
      , loadCollection('Competition')
      , function (req, res) {
  res.render('result-table', {
    results: req.results
  , competitions: _.map(req.Competition.instances, function (c) {
      return c.toObject({ getters: true});
    })
  });
});

////
// Results updating
////

app.put('/results/:param'
       , loadInstance('Competition', 'param')
       , function (req, res) {
  _.each(req.body, function (result, section) {
    db.Result.update({
      section: section
    , competition: req.Competition.instance.id
    }, {
      minutes: result.minutes || 0
    , seconds: result.seconds || 0
    , points: result.points || 0
    , disqualified: result.disqualified === 'true'
    }, {
      upsert: true
    }, function () {});
  });
  res.redirect('/');
});

server.listen(app.get('port'), function () {
  logs.express.info('Express server listening on port ' + app.get('port'));
});
