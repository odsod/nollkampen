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
          results: results
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
      seconds: req.body.seconds,
      message: req.body.message
    });
  },

  megaCountdown: function (req) {
    io.sockets.emit('megaCountdown', {
      seconds: req.body.seconds
    });
  },

  throwdown: function (req) {
    db.Picture.findByAlias(req.body.picture, function (err, pic) {
      if (pic) {
        io.sockets.emit('throwdown', {
          image: pic.image,
          caption: pic.caption
        });
      }
    });
  }

, slideshow: function (req) {
    db.Slideshow.findByAlias(req.body.slideshow, function (err, slideshow) {
      if (slideshow) {
        io.sockets.emit('slideshow', {
          images: slideshow.images
        });
      }
    });
  }

, autoThrowdown: function (req) {
    db.Slideshow.findByAlias(req.body.slideshow, function (err, slideshow) {
      if (slideshow) {
        io.sockets.emit('autoThrowdown', {
          throwdowns: _.map(slideshow.images, function (image, i) {
            return {
              image: image
            , caption: req.body['cap' + i] || ''
            };
          })
        });
      }
    });
  }

, textmessage: function (req) {
    log.debug('tm');
    io.sockets.emit('textmessage', {
      horizontalPos: req.body.h
    , verticalPos: req.body.v
    , message: req.body.message
    });
  }

, sketch: function (req) {
    log.debug('sketchcontr');
    db.Picture.findByAlias(req.body.picture, function (err, picture) {
      log.data(picture.toObject({ getters: true }));
      io.sockets.emit('sketch', {
        image: picture.image
      });
    });
  }

, fullscreenPicture: function (req) {
    log.debug('fulpic');
    db.Picture.findByAlias(req.body.picture, function (err, picture) {
      io.sockets.emit('fullscreenPicture', {
        image: picture.image
      });
    });
  }
};

ScreenController.handleAction = function (req, res) {
  var action = actions[req.body.action];
  if (action) {
    action(req);
  }
  res.redirect('/');
};

ScreenController.showInstapic = function (req, res) {
  res.render('instapic', {
    captions: [' ', 'test1', 'test2']
  });
};

ScreenController.createInstapic = function (req, res) {
  var pic = new db.Picture({
    name: 'instapic'
  , caption: req.body.inputCaption.trim() || req.body.selectCaption.trim()
  });
  pic.image = req.files.image;
  pic.save(function (err, pic) {
    io.sockets.emit('throwdown', {
      image: pic.image,
      caption: pic.caption
    });
    res.redirect('/screen/instapic');
  });
};

ScreenController.sketchServer = function (req, res) {
  res.render('sketch-server', {
    image: req.Picture.instance.image
  });
};

ScreenController.listSketchPictures = function (req, res) {
  res.render('list', {
    title: 'Liveritning'
  , noCrud: true
  , modelName: 'ritning'
  , root: '/screen/pictures'
  , linkTo: '/screen/sketches'
  , collection: req.Picture.instances
  });
};

ScreenController.listen = function (app) {
  io = io.listen(app, {
    logger: require('../logs').sockets
  });
  io.sockets.on('connection', function (socket) {
    socket.on('sketchstroke', function (data) {
      log.info('sketchstroke', data);
      io.sockets.emit('sketchstroke', data);
    });
  });
};
