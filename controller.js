var _ = require('underscore')
  , db = require('./db')
  , log = require('./logs').app;

var Controller = module.exports = function Controller(options) {
  this.model = db[options.model];
  this.options = options;
};

Controller.prototype.index = function (req, res) {
  res.render('list', {
    title: this.options.locale.modelPlural
  , modelName: this.options.locale.modelSingular.toLowerCase()
  , root: this.options.root
  , collection: _.map(req.collection, function (instance) {
      return instance.toObject({ getters: true });
    })
  });
};

Controller.prototype.new = function (req, res) {
  res.render(this.options.form, {
    title: 'Skapa ' + this.options.locale.modelSingular.toLowerCase()
  , modelName: this.options.locale.modelSingular.toLowerCase()
  , action: this.options.root
  , method: 'post'
  , instance: {}
  });
};

Controller.prototype.edit = function (req, res) {
  res.render(this.options.form, {
    title: 'Editera ' + this.options.locale.modelSingular.toLowerCase()
  , modelName: this.options.locale.modelSingular.toLowerCase()
  , action: this.options.root + '/' + req.instance.alias
  , method: 'put'
  , instance: req.instance
  });
};

Controller.prototype.destroy = function (req, res) {
  var self = this;
  req.instance.remove(function (err) {
    res.redirect(self.options.root);
  });
};

Controller.prototype.upsert = function (req, res) {
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

Controller.prototype.create = Controller.prototype.upsert;

Controller.prototype.update = Controller.prototype.upsert;

Controller.prototype.loadInstance = function (req, res, next) {
  this.model.findByAlias(req.params.id, function (err, instance) {
    req.instance = instance;
    next();
  });
};

Controller.prototype.loadCollection = function (req, res, next) {
  this.model.find(function (err, collection) {
    req.collection = collection;
    next();
  });
};
