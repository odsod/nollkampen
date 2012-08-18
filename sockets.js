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
      alternateTextColor: '#eee',
      saint: s.saintImageUrl,
      results: [],
      total: 0
    }; 
    req.competitions.forEach(function (c) {
      var
        time = _.find(req.times, function (t) {
          return t.section == s.id && t.competition == c.id;
        }).text,
        points = _.find(req.scores, function (sc) {
          return sc.section == s.id && sc.competition == c.id;
        }).points;
      section.results.push({
        time: time,
        points: points
      });
      section.total += points;
    });
    data.sections.push(section);
  });
  req.competitions.forEach(function (c) {
    data.competitions.push({
      name: c.name
    });
  });
  data.sections.sort(function (s1, s2) {
    // Higher score first
    return s2.total - s1.total; 
  });
  // Assign place numbers
  var currPlace = 0;
  var currTotal = Number.POSITIVE_INFINITY;
  data.sections.forEach(function (section) {
    if (section.total < currTotal) {
      currPlace += 1;
    }
    section.place = currPlace;
    currTotal = section.total;
  });
  io.sockets.emit('scoreboard', data);
  res.redirect('/');
}
