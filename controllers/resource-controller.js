var _   = require('underscore')
  , db  = require('../db')
  , log = require('../logs').app;

var ResourceController = module.exports = function ResourceController(options) {};

ResourceController.resource = function (app, root, options) {

  options.model = db[options.model];
  options.options = options;

  ////
  // Index
  ////
  app.get(
    root
  , ResourceController.loadCollection.bind(options)
  , ResourceController.index.bind(options)
  );

  ////
  // New
  ////
  app.get(
    root + '/new'
    , ResourceController.new.bind(options)
  );

  ////
  // Edit
  ////
  app.get(
    root + '/:param'
    , ResourceController.loadInstance.bind(options)
    , ResourceController.edit.bind(options)
  );

  ////
  // Create
  ////
  app.post(
    root
  , ResourceController.create.bind(options)
  );

  ////
  // Update
  ////
  app.put(
    root + '/:param'
  , ResourceController.loadInstance.bind(options)
  , ResourceController.update.bind(options)
  );

  ////
  // Delete
  ////
  app.delete(
    root + '/:param'
  , ResourceController.loadInstance.bind(options)
  , ResourceController.destroy.bind(options)
  );

};

ResourceController.index = function (req, res) {
  res.render(this.options.index || 'list', {
    title: this.options.locale.modelPlural
  , modelName: this.options.locale.modelSingular.toLowerCase()
  , root: this.options.root
  , collection: _.map(req.collection, function (instance) {
      return instance.toObject({ getters: true });
    })
  });
};

ResourceController.new = function (req, res) {
  res.render(this.options.form, {
    title: 'Skapa ' + this.options.locale.modelSingular.toLowerCase()
  , modelName: this.options.locale.modelSingular.toLowerCase()
  , action: this.options.root
  , method: 'post'
  , instance: {}
  });
};

ResourceController.edit = function (req, res) {
  res.render(this.options.form, {
    title: 'Editera ' + this.options.locale.modelSingular.toLowerCase()
  , modelName: this.options.locale.modelSingular.toLowerCase()
  , action: this.options.root + '/' + req.instance.alias
  , method: 'put'
  , instance: req.instance
  });
};

ResourceController.destroy = function (req, res) {
  var self = this;
  req.instance.remove(function (err) {
    res.redirect(self.options.root);
  });
};

ResourceController.upsert = function (req, res) {
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

ResourceController.create = ResourceController.prototype.upsert;

ResourceController.update = ResourceController.prototype.upsert;

ResourceController.loadInstance = function (req, res, next) {
  this.model.findByAlias(req.param, function (err, instance) {
    req.instance = instance;
    next();
  });
};

ResourceController.loadCollection = function (req, res, next) {
  this.model.find(function (err, collection) {
    req.collection = collection;
    next();
  });
};
