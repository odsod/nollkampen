var 
  io = require('socket.io'),
  _ = require('underscore'),
  log = require('winston').cli();

exports.listen = function (app) {
  io = io.listen(app);
  io.set('logger', log);
  return exports;
}

exports.clear = function (req, res) {
  io.sockets.emit('clear');
  res.end();
}

exports.showScoreboard = function (req, res) {
  var data = {
    sections: [],
    competitions: [],
    ads: req.ads
  };
  req.sections.forEach(function (s) {
    var section = {
      name: s.name,
      initials: s.initials,
      color: s.color,
      textColor: s.textColor,
      saint: s.saintImageUrl,
      results: []
    }; 
    req.competitions.forEach(function (c) {
      section.results.push({
        time: _.find(req.times, function (t) {
          return t.section == s.id && t.competition == c.id;
        }).text,
        points: _.find(req.scores, function (sc) {
          return sc.section == s.id && sc.competition == c.id;
        }).points
      });
    });
    data.sections.push(section);
  });
  req.competitions.forEach(function (c) {
    data.competitions.push({
      name: c.name
    });
  });
  io.sockets.emit('scoreboard', data);
  res.redirect('/');
}
