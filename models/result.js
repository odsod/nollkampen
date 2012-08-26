var mongoose = require('mongoose')
  , _        = require('underscore')
  , Schema   = mongoose.Schema
  , ObjectId = Schema.ObjectId
  , log      = require('../logs').app;

////
// Result
////

var Result = module.exports = new Schema({
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
    return ' ';
  }
});

Result.statics.compileTotal = function (callback) {
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
      log.data(results);
      callback(results);
    });
};
