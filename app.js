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

app.param(function (name, modelName) {
  return function (req, res, next, val) {
    db.model(modelName).findById(val, function (err, instance) {
      req[name] = instance;
      next();
    });
  };
});

app.param('section', 'Section');
app.param('competition', 'Competition');
app.param('ad', 'Ad');
app.param('picture', 'Picture');
app.param('sequence', 'Sequence');
app.param('slideshow', 'Slideshow');
app.param('image', 'ImageData');

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
app.get('/resources/:image', routes.sendImage);

// Sections CRUD
app.get('/sections'
      , loadModel('Section')
      , routes.listSections);
app.get('/sections/new', routes.newSection);
app.get('/sections/:section', routes.editSection);
app.post('/sections', routes.createSection);
app.post('/sections/:section/delete', routes.deleteSection);
app.post('/sections/:section/update', routes.updateSection);

// Competitions CRUD
app.get('/competitions'
      , loadModel('Competition')
      , routes.listCompetitions);
app.get('/competitions/new', routes.newCompetition);
app.get('/competitions/:competition', routes.editCompetition);
app.post('/competitions', routes.createCompetition);
app.post('/competitions/:competition/update', routes.updateCompetition);
app.post('/competitions/:competition/delete', routes.deleteCompetition);

// Ads CRUD
app.get('/ads'
      , loadModel('Ad')
      , routes.listAds);
app.get('/ads/new', routes.newAd);
app.get('/ads/:ad', routes.editAd);
app.post('/ads', routes.createAd);
app.post('/ads/:ad/delete', routes.deleteAd);
app.post('/ads/:ad/update', routes.updateAd);

// Pictures CRUD
app.get('/pictures'
      , loadModel('Picture')
      , routes.listPictures);
app.get('/pictures/new', routes.newPicture);
app.get('/pictures/:picture', routes.editPicture);
app.post('/pictures', routes.createPicture);
app.post('/pictures/:picture/delete', routes.deletePicture);

// Scores
app.get('/scores'
      , loadModel('Competition')
      , loadModel('Section')
      , loadModel('Score')
      , routes.showScoreTable);
app.get('/scores/:competition'
      , loadModel('Competition')
      , loadModel('Section')
      , routes.showCompetitionScores);
app.post('/scores/:competition'
       , loadModel('Section')
       , routes.updateCompetitionScores);

// Times
app.get('/times'
      , loadModel('Competition')
      , loadModel('Section')
      , loadModel('Time')
      , routes.showTimeTable);
app.get('/times/:competition'
      , loadModel('Competition')
      , loadModel('Section')
      , routes.showCompetitionTimes);
app.post('/times/:competition'
       , loadModel('Section')
       , routes.updateCompetitionTimes);

// Sequence showing
app.get('/sequences/show'
      , loadModel('Sequence')
      , routes.listShowableSequences);
app.get('/sequences/show/:sequence', routes.showSequence);

// Sequence CRUD
app.get('/sequences'
      , loadModel('Sequence')
      , routes.listSequences);
app.get('/sequences/new'
      , routes.newSequence);
app.get('/sequences/:sequence', routes.editSequence);
app.post('/sequences', routes.createSequence);
app.post('/sequences/:sequence/update', routes.updateSequence);
app.post('/sequences/:sequence/delete', routes.deleteSequence);

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
