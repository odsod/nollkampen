/*jshint camelcase:false */

var express           = require('express')
  , app               = express()
  , Controller        = require('./controller')
  , server            = require('http').createServer(app)
  , sockets           = require('./sockets').listen(server)
  // , routes            = require('./routes')
  , path              = require('path')
  , db                = require('./db')
  , connectHandlebars = require('connect-handlebars')
  , logs              = require('./logs')
  , log               = logs.app;

// Config: All
app.configure(function () {
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  // Connect express logger to Winston
  app.use(express.logger({ stream: logs.expressStream }));
  app.use(express.bodyParser({
    uploadDir: __dirname + '/public/uploads'
  }));
  app.use(express.methodOverride());
  app.use(app.router);
  // Compile stylus stylesheets
  app.use(require('stylus').middleware(__dirname + '/public'));
  // Precompile client-side templates
  app.use('/templates.js', connectHandlebars(__dirname + '/templates', {
    exts_re: /\.hbs$|\.handlebars$/,
    recursive: true,
    encoding: 'utf8'
  }));
  // Serve static files from public
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function () {
  app.use(express.errorHandler());
});

app.get('/', function (req, res) {
  res.render('index');
});

app.param('id', function (req, res, next, id) {
  req.params.id = id;
  next();
});

function resource(root, controller) {

  // Index action
  app.get(
    root
  , controller.loadCollection.bind(controller)
  , controller.index.bind(controller)
  );

  // New action
  app.get(
    root + '/new'
    , controller.new.bind(controller)
  );

  // Edit action
  app.get(
    root + '/:id'
    , controller.loadInstance.bind(controller)
    , controller.edit.bind(controller)
  );

  // Create action
  app.post(
    root
  , controller.create.bind(controller)
  );

  // Update
  app.put(
    root + '/:id'
  , controller.loadInstance.bind(controller)
  , controller.update.bind(controller)
  );

  // Delete
  app.delete(
    root + '/:id'
  , controller.loadInstance.bind(controller)
  , controller.destroy.bind(controller)
  );

}

resource('/competitions', new Controller({
  model: 'Competition'
, root: '/competitions'
, form: 'competition-form'
, locale: {
    modelSingular: 'Gren'
  , modelPlural: 'Grenar'
  }
}));

server.listen(app.get('port'), function () {
  logs.express.info('Express server listening on port ' + app.get('port'));
});
