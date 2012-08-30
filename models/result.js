var _        = require('underscore')
  , ObjectId = require('mongoose').Schema.ObjectId;

////
// Result
////

var Result = module.exports = new (require('mongoose')).Schema({
  section:      { type: ObjectId, ref: 'Section', index: true }
, competition:  { type: ObjectId, ref: 'Competition', index: true }
, minutes:      Number
, seconds:      Number
, points:       Number
, disqualified: Boolean
});

Result.virtual('time').get(function () {
  if (_.isNumber(this.minutes) && _.isNumber(this.seconds)) {
    return this.minutes + ':' + (this.seconds < 9 ? '0' : '') + this.seconds;
  } else {
    return ' ';
  }
});

Result.virtual('score').get(function () {
  if (this.disqualified) {
    return 'DISKAD!';
  } else if (this.points) {
    return this.points;
  } else {
    // Purposefully let 0 fall through to here
    return ' ';
  }
});

Result.statics.compileTotal = function (callback) {
  var self = this;
  this
    .find()
    .populate('competition')
    .populate('section')
    .exec(function (err, results) {
      // Prepare for takeoff...
      // Convert to regular objects
      results = _.map(results, function (result) {
        return result.toObject({ getters: true });
      });
      // Lift up section id (for grouping)
      results = _.map(results, function (result) {
        return _.extend(result, {
          sectionId: result.section.id
        });
      });
      // Group by section
      results = _.groupBy(results, 'sectionId');
      // Calculate total score and scrub results
      results = _.map(results, function (results, section) {
        // Extend with section data
        return _.extend(results[0].section, {
          // Calculate total score
          total: _.reduce(results, function (memo, result) {
            return memo + result.points;
          }, 0) || 0
          // Scrub results and sort by competition order
        , results: _.sortBy(_.map(results, function (result) {
            return {
              time: result.time,
              points: result.points,
              score: result.score,
              disqualified: result.disqualified,
              order: result.competition.order,
              competition: result.competition.id,
              competitionName: result.competition.name
            };
          }), 'order')
        });
      });
      // Sort by total score (descending)
      results = _.sortBy(results, function (section) {
        return - section.total;
      });
      // Assign place numbers
      var currPlace = 0
        , currTotal = Number.POSITIVE_INFINITY;
      results.forEach(function (result) {
        if (result.total < currTotal) {
          currPlace += 1;
          currTotal = result.total;
        }
        result.place = currPlace;
      });
      // Touchdown!
      callback(results);
    });
};

Result.statics.compileCompetition = function (competition, callback) {
  var self = this;
  this.model('Competition').findByAlias(competition, function (err, competition) {
    self
      .find({ competition: competition._id })
      .populate('section')
      .exec(function (err, results) {
        // Prepare for takeoff...
        // Convert to regular objects
        results = _.map(results, function (result) {
          return result.toObject({ getters: true });
        });
        // Lift up section id (for grouping)
        results = _.map(results, function (result) {
          return _.extend(result, {
            sectionId: result.section.id
          });
        });
        // Group by section
        results = _.groupBy(results, 'sectionId');
        // Lift up results and data
        results = _.map(results, function (results, section) {
          // Return section extended with result data
          return _.extend(results[0].section, {
            time: results[0].time
          , points: results[0].points
          });
        });
        // Sort by points (descending)
        results = _.sortBy(results, function (section) {
          return - section.points;
        });
        // Assign place numbers
        var currPlace = 0
          , currPoints = Number.POSITIVE_INFINITY;
        results.forEach(function (result) {
          if (result.points < currPoints) {
            currPlace += 1;
            currPoints = result.points;
          }
          result.place = currPlace;
        });
        // Touchdown!
        callback(results);
      });
  });
};
