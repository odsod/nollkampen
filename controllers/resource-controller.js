var _   = require('underscore')
  , db  = require('../models')
  , log = require('../logs').app;

var ResourceController = module.exports = function ResourceController(options) {
  this.model = db[options.model];
  this.options = options;
};

ResourceController.resource = function (app, root, options) {

  var c = new ResourceController(options);

  ////
  // Index
  ////
  app.get(
    root
  , ResourceController.loadCollection(options.model)
  , c.index.bind(c)
  );

  ////
  // New
  ////
  app.get(
    root + '/new'
  , c.new.bind(c)
  );

  ////
  // Edit
  ////
  app.get(
    root + '/:param'
  , c.loadInstance.bind(c)
  , c.edit.bind(c)
  );

  ////
  // Create
  ////
  app.post(
    root
  , c.create.bind(c)
  );

  ////
  // Update
  ////
  app.put(
    root + '/:param'
  , c.loadInstance.bind(c)
  , c.update.bind(c)
  );

  ////
  // Delete
  ////
  app.delete(
    root + '/:param'
  , c.loadInstance.bind(c)
  , c.destroy.bind(c)
  );

};

ResourceController.prototype.index = function (req, res) {
  res.render(this.options.index || 'list', {
    title: this.options.locale.modelPlural
  , modelName: this.options.locale.modelSingular.toLowerCase()
  , root: this.options.root
  , collection: _.map(req[this.options.model].instances, function (instance) {
      return instance.toObject({ getters: true });
    })
  });
};

ResourceController.prototype.new = function (req, res) {
  var instance = new (this.model)().toObject({ getters: true });
  res.render(this.options.form, {
    title: 'Skapa ' + this.options.locale.modelSingular.toLowerCase()
  , modelName: this.options.locale.modelSingular.toLowerCase()
  , action: this.options.root
  , method: 'post'
  , instance: instance
  });
};

ResourceController.prototype.edit = function (req, res) {
  res.render(this.options.form, {
    title: 'Editera ' + this.options.locale.modelSingular.toLowerCase()
  , modelName: this.options.locale.modelSingular.toLowerCase()
  , action: this.options.root + '/' + req.instance.alias
  , method: 'put'
  , instance: req.instance.toObject({ getters: true })
  });
};

ResourceController.prototype.destroy = function (req, res) {
  var self = this;
  req.instance.remove(function (err) {
    res.redirect(self.options.root);
  });
};

ResourceController.prototype.upsert = function (req, res) {
  var self = this;
  var instance = req.instance || new this.model();
  _.each(req.body.attrs, function (value, key) {
    instance[key] = value;
  });
  if (this.options.upsertHook) {
    this.options.upsertHook(req, instance);
  }
  instance.save(function (err) {
    res.redirect(self.options.root);
  });
};

ResourceController.prototype.create = ResourceController.prototype.upsert;

ResourceController.prototype.update = ResourceController.prototype.upsert;

ResourceController.prototype.loadInstance = function (req, res, next) {
  this.model.findByAlias(req.param, function (err, instance) {
    req.instance = instance;
    next();
  });
};

ResourceController.loadInstance = function (modelName, param) {
  return function (req, res, next) {
    db[modelName].findByAlias(req.param, function (err, instance) {
      req[modelName] = { instance: instance };
      next();
    });
  };
};

ResourceController.loadCollection = function (modelName) {
  return function (req, res, next) {
    db[modelName].find(function (err, instances) {
      req[modelName] = { instances: instances };
      next();
    });
  };
};

////
// Upsert hook for saving images
////

ResourceController.saveImageHook = function (req, instance) {
  instance.image = req.files.image;
};

ResourceController.saveImagesHook = function (req, instance) {
  instance.images = req.files.images;
};
