var 
  io = require('socket.io'),
  _ = require('underscore'),
  log = require('winston').cli();

exports.listen = function (app) {
  io = io.listen(app);
  io.set('logger', log);
  io.set('log level', 1);
  return exports;
}

exports.showScoreboard = function (req, res) {
  var data = {
    sections: [],
    competitions: [],
    ads: [] 
  };
  req.sections.forEach(function (s) {
    var section = {
      name: s.name,
      initials: s.initials,
      color: s.color,
      textColor: s.textColor,
      results: []
    }; 
    req.competitions.forEach(function (c) {
      section.results.push({
        time: _.find(req.times, function (t) {
          return t.section == s.id && t.competition == c.id;
        }),
        points: _.find(req.scores, function (sc) {
          return sc.section == s.id && sc.competition == c.id;
        })
      });
    });
    data.sections.push(section);
  });
  req.competitions.forEach(function (c) {
    data.competitions.push({
      name: c.name
    });
  });
  io.sockets.emit('hello world', data);
  res.end();
}
