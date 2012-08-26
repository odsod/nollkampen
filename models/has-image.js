var _        = require('underscore')
  , mongoose = require('mongoose')
  , fs       = require('fs');

////
// Default server route
////

var route = '/img';

////
// Server
////

function createServer(options) {
  var connection = mongoose;
  if (options) {
    route = options.route || route;
    connection = options.connection || mongoose;
  }
  return function (req, res) {
    connection.model(req.query.model)
      .findById(req.query.id)
      .select('imageData')
      .slice('imageData', req.query.i, 1)
      .exec(function (err, instance) {
        var image = instance.imageData.pop();
        res.contentType(image.mime);
        res.send(image.data);
      });
  };
}


////
// has-image plugin
////

function hasImage(schema, options) {

  // Add data and mime subdocs
  schema.add({
    imageData: [{
      data: { type: Buffer, select: false }
    , mime: String
    }]
  });

  // Set a single image
  schema.virtual('image').set(function (image) {
    if (image && image.size > 0) {
      this.imageData = [{
        data: fs.readFileSync(image.path)
      , mime: image.mime
      }];
    }
  });

  // Set multiple images
  schema.virtual('images').set(function (images) {
    this.imageData = [];
    images.forEach(function (image) {
      if (image.size > 0) {
        this.imageData.push({
          data: fs.readFileSync(image.path)
        , mime: image.mime
        });
      }
    });
  });

  // Get url for a single image
  schema.virtual('image').get(function () {
    return route + '?id=' + this._id + '&model=' + this.constructor.modelName + '&i=0';
  });

  // Get urls for multiple images
  schema.virtual('images').get(function () {
    return _.map(_.range(this.imageData.length), function (i) {
      return route + '?id=' + this._id + '&model=' + this.constructor.modelName + '&i=' + i;
    });
  });
}

module.exports = {
  plugin: hasImage,
  createServer: createServer
};
