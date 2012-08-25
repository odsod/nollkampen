var _ = require('underscore')
  , db = require('../db');

var ResultsController = module.exports = function ResultsController() {};

ResultsController.loadTotals = function (req, res, next) {
  db.Result.compileTotal(function (results) {
    req.results = results;
    next();
  });
};

ResultsController.list = function (req, res) {
  res.render('result-table', {
    results: req.results
  , competitions: _.map(req.Competition.instances, function (c) {
      return c.toObject({ getters: true});
    })
  });
};

ResultsController.edit = function (req, res) {
  res.render('result-form', {
    action: '/results/' + req.param
  , method: 'put'
  , title: 'Resultat för ' + req.Competition.instance.alias.toLowerCase()
  , sections: req.Section.instances
  , results: _.groupBy(req.Result.instances, 'section')
  , modelName: 'resultat'
  });
};

ResultsController.update = function (req, res) {
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
};
