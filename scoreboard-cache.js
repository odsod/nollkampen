var mongoose = require('mongoose')
  , _        = require('underscore')
  , Schema   = mongoose.Schema
  , ObjectId = Schema.ObjectId
  , log      = require('../logs').app;

////
// Scoreboard cache
////

var ScoreboardCache = module.exports = new Schema({
  cacheType: { type: String, enum: ['total', 'competition'], index: true }
, for: { type: String, index: true }
, cache: Schema.Types.Mixed
});

ScoreboardCache.statics.flush = function () {
  var self = this;
  this.model('Competition').find(function (competitions) {
    competitions = _.map(competitions, function (c) {
      return c.toObject({ getters: true });
    });
    this.model('Ad').find(function (ads) {
      ads = _.map(ads, function (a) {
        return a.toObject({ getters: true });
      });
      // Cache total results
      this.model('Result').compileTotal(function (results) {
        // Update total results cache
        self.findOneAndUpdate({
          cacheType: 'total'
        }, {
          cache: {
            results: results
          , competitions: competitions
          , ads: ads
          }
        }, {
          upsert: true
        }, function () {});
      });
      // Cache competition results
      competitions.forEach(function (competition) {
        self.model('Result').compileCompetition(competition.alias, function (results) {
          // Update total results cache
          self.findOneAndUpdate({
            cacheType: 'competition'
          , for: competition.alias
          }, {
            cache: {
              results: results
            , ads: ads
            }
          }, {
            upsert: true
          }, function () {});
        });
      });
    });
  });
};
