var io = require('socket.io')
  , _ = require('underscore')
  , db = require('../models')
  , log = require('../logs').app;

var ScreenController = module.exports = function ScreenController() {};

ScreenController.screen = function (req, res) {
  res.render('screen');
};

ScreenController.listSequences = function (req, res) {
  res.render('list', {
    title: 'Visa sekvens'
  , noCrud: true
  , modelName: 'sekvens'
  , root: '/screen/sequences'
  , linkTo: '/screen/sequences'
  , collection: req.Sequence.instances
  });
};

ScreenController.showSequence = function (req, res) {
  res.render('sequence-show', {
    sequence: req.Sequence.instance
  });
};

var actions = {

  clear: function (req) {
    io.sockets.emit('clear');
  },

  scoreboard: function (req) {
    db.Result.compileTotal(function (results) {
      db.Competition.find(function (err, competitions) {
        db.Ad.find(function (err, ads) {
          io.sockets.emit('scoreboard', {
            results: results
          , competitions: _.sortBy(_.map(competitions, function (c) {
              return c.toObject({ getters: true });
            }), 'order')
          , ads: _.map(ads, function (a) {
              return a.toObject({ getters: true });
            })
          });
        });
      });
    });
  },

  revealCompetition: function (req) {
    db.Result.compileCompetition(req.body.competition, function (results) {
      db.Ad.find(function (err, ads) {
        io.sockets.emit('revealCompetition', {
          results: _.first(results, 3)
        , ads: _.map(ads, function (a) {
            return a.toObject({ getters: true });
          })
        });
      });
    });
  },

  revealTotal: function (req) {
    db.Result.compileTotal(function (results) {
      db.Competition.find(function (err, competitions) {
        db.Ad.find(function (err, ads) {
          io.sockets.emit('revealTotal', {
            results: results
          , competitions: _.sortBy(_.map(competitions, function (c) {
              return c.toObject({ getters: true });
            }), 'order')
          , ads: _.map(ads, function (a) {
              return a.toObject({ getters: true });
            })
          });
        });
      });
    });
  },

  revealNext: function (req) {
    io.sockets.emit('revealNext');
  },

  countdown: function (req) {
    io.sockets.emit('countdown', {
      seconds: req.body.seconds
    });
  },

  throwdown: function (req) {
    var data = {
      pictures: []
    };
    req.pictures.forEach(function (p) {
      data.pictures.push({
        caption: 'test',
        url: p.imageUrl
      });
    });
    io.sockets.emit('throwdown', data);
  }

};

ScreenController.handleAction = function (req, res) {
  var action = actions[req.body.action];
  if (action) {
    action(req);
  }
  res.redirect('/');
};

ScreenController.listen = function (app) {
  io = io.listen(app);
  io.set('logger', require('../logs').sockets);
};
