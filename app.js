/*jshint camelcase:false */

var express           = require('express')
  , app               = express()
  , server            = require('http').createServer(app)
  , sockets           = require('./sockets').listen(server)
  , routes            = require('./routes')
  , path              = require('path')
  , _                 = require('underscore')
  , db                = require('./db')
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
    uploadDir: __dirname + '/public/uploads'
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

// Config: Development
app.configure('development', function () {
  app.use(express.errorHandler());
});

app.param(function (modelName, findMethod) {
  return function (req, res, next, val) {
    db.model(modelName)[findMethod](val, function (err, instance) {
      req[modelName] = req[modelName] || {};
      req[modelName].instance = instance;
      next();
    });
  };
});

app.param('Section',     'findByInitials');
app.param('Competition', 'findByName');
app.param('Ad',          'findByName');
app.param('Picture',     'findByName');
app.param('Sequence',    'findByName');
app.param('Slideshow',   'findByName');
app.param('ImageData',   'findById');

function loadInstanceFromBody(modelName) {
  return function (req, res, next) {
    if (req.body[modelName]) {
      db.model(modelName).findById(req.body[modelName].instance, function (err, instance) {
        if (err) {
          log.error(err);
          return res.send('Something went wrong..');
        } else {
          req[modelName] = req[modelName] || {};
          req[modelName].instance = instance;
          next();
        }
      });
    } else {
      next();
    }
  };
}

function loadModel(modelName) {
  return function (req, res, next) {
    db.model(modelName).find(function (err, instances) {
      if (err) {
        log.error(err);
        return res.send('Something went wrong..');
      } else {
        req[modelName] = req[modelName] || {};
        req[modelName].instances = instances;
        next();
      }
    });
  };
}

function calculateResults(req, res, next) {
  var
    results = {},
    times = {},
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
          return sc.section === s.id && sc.competition === c.id;
        }).points;
      var t = _.find(req.times, function (t) {
        return t.section === s.id && t.competition === c.id;
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
      (s1.initials === 'IT' && -1) ||
      (s2.initials === 'IT' && 1) ||
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
         (s1.initials === 'IT' && -1) ||
         (s2.initials === 'IT' && 1) ||
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
app.get('/resources/:ImageData', routes.sendImageData);

////
// Sections CRUD
////

app.get('/sections', loadModel('Section'), routes.list('Section'));

app.get('/sections/new',               routes.new('Section'));
app.get('/sections/:Section',          routes.edit('Section'));
app.post('/sections/:Section/delete',  routes.delete('Section'));
app.post('/sections',                  routes.upsertSection);
app.post('/sections/:Section/update',  routes.upsertSection);

////
// Competitions CRUD
////

app.get('/competitions', loadModel('Competition'), routes.list('Competition'));

app.get('/competitions/new',                   routes.new('Competition'));
app.get('/competitions/:Competition',          routes.edit('Competition'));
app.post('/competitions/:Competition/delete',  routes.delete('Competition'));
app.post('/competitions',                      routes.upsertCompetition);
app.post('/competitions/:Competition/update',  routes.upsertCompetition);

////
// Ads CRUD
////

app.get('/ads', loadModel('Ad'), routes.list('Ad'));

app.get('/ads/new',          routes.new('Ad'));
app.get('/ads/:Ad',          routes.edit('Ad'));
app.post('/ads/:Ad/delete',  routes.delete('Ad'));
app.post('/ads',             routes.upsertAd);
app.post('/ads/:Ad/update',  routes.upsertAd);

////
// Pictures CRUD
////

app.get('/pictures', loadModel('Picture'), routes.list('Picture'));

app.get('/pictures/new',               routes.new('Picture'));
app.get('/pictures/:Picture',          routes.edit('Picture'));
app.post('/pictures',                  routes.upsertPicture);
app.post('/pictures/:Picture/update',  routes.upsertPicture);
app.post('/pictures/:Picture/delete',  routes.delete('Picture'));

// Scores
app.get('/scores'
      , loadModel('Competition')
      , loadModel('Section')
      , loadModel('Score')
      , routes.showScoreTable);
app.get('/scores/:Competition'
      , loadModel('Competition')
      , loadModel('Section')
      , routes.showCompetitionScores);
app.post('/scores/:Competition'
       , loadModel('Section')
       , routes.updateCompetitionScores);

// Times
app.get('/times'
      , loadModel('Competition')
      , loadModel('Section')
      , loadModel('Time')
      , routes.showTimeTable);
app.get('/times/:Competition'
      , loadModel('Competition')
      , loadModel('Section')
      , routes.showCompetitionTimes);
app.post('/times/:Competition'
       , loadModel('Section')
       , routes.updateCompetitionTimes);

// Sequence showing
app.get('/sequences/show'
      , loadModel('Sequence')
      , routes.listShowableSequences);
app.get('/sequences/show/:Sequence', routes.showSequence);

// Sequence CRUD
app.get('/sequences'
      , loadModel('Sequence')
      , routes.listSequences);
app.get('/sequences/new'
      , routes.newSequence);
app.get('/sequences/:Sequence', routes.editSequence);
app.post('/sequences', routes.createSequence);
app.post('/sequences/:Sequence/update', routes.updateSequence);
app.post('/sequences/:Sequence/delete', routes.deleteSequence);

// Actions posted to /screen are forwarded through socket
app.post('/screen'
       , loadModel('Competition')
       , loadModel('Section')
       , loadModel('Time')
       , loadModel('Score')
       , loadModel('Ad')
       , loadModel('Picture')
       , loadInstanceFromBody('Competition')
       , calculateResults
       , sockets.handle);

server.listen(app.get('port'), function () {
  logs.express.info('Express server listening on port ' + app.get('port'));
});
