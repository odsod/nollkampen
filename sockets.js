var 
  io = require('socket.io'),
  _ = require('underscore'),
  db = require('./db'),
  log = require('winston').cli();

function sectionOrder(s1, s2) {
  // Higher score first
  return (s2.points - s1.points) || 
         (s1.initials == 'IT' && -1) || 
         (s2.initials == 'IT' && 1) || 
         (s1.initials.toLowerCase() > s2.initials.toLowerCase() && 1) ||
         (s1.initials.toLowerCase() < s2.initials.toLowerCase() && -1) || 
         0;
}

var actions = {

  clear: function (req) {
    io.sockets.emit('clear');
  },

  scoreboard: function (req) {
    var data = {
      sections: [],
      competitions: req.competitions,
      ads: req.ads
    };
    req.sections.forEach(function (s) {
      data.sections.push({
        name: s.name,
        initials: s.initials,
        color: s.color,
        textColor: s.textColor,
        alternateTextColor: s.alternateTextColor,
        results: req.results[s.id],
        points: req.points[s.id],
        place: req.places[s.id],
        saint: s.saintImageUrl
      });
    });
    data.sections.sort(sectionOrder);
    io.sockets.emit('scoreboard', data);
  },

  revealCompetition: function (req) {
    var data = {
      sections: [],
      competition: req.competition,
      ads: req.ads
    };
    log.warn(req.competition.id);
    req.sections.forEach(function (s) {
      data.sections.push({
        name: s.name,
        initials: s.initials,
        color: s.color,
        textColor: s.textColor,
        alternateTextColor: s.alternateTextColor,
        saint: s.saintImageUrl,
        time: req.times[req.competition.id][s.id],
        points: req.points[req.competition.id][s.id],
        place: req.places[req.competition.id][s.id]
      });
    });
    data.sections.sort(sectionOrder);
    data.sections = _.filter(data.sections, function (section) {
      return section.place <= 3;
    });
    io.sockets.emit('revealCompetition', data);
  },

  revealTotal: function (req) {
    var data = {
      sections: [],
      competitions: req.competitions,
      competition: req.competition,
      ads: req.ads
    };
    req.sections.forEach(function (s) {
      data.sections.push({
        name: s.name,
        initials: s.initials,
        color: s.color,
        textColor: s.textColor,
        alternateTextColor: s.alternateTextColor,
        saint: s.saintImageUrl,
        results: req.results[s.id],
        points: req.points[s.id],
        place: req.places[s.id]
      });
    });
    data.sections.sort(sectionOrder);
    data.sections = _.filter(data.sections, function (section) {
      return section.place <= 3;
    });
    io.sockets.emit('revealTotal', data);
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

exports.handle = function (req, res) {
  var action = actions[req.body.action];
  if (action) action(req);
  res.redirect('/');
}

exports.listen = function (app) {
  io = io.listen(app);
  io.set('logger', log);
  io.set('log level', 0);
  return exports;
}
