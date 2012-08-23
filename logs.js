var winston = require('winston')
  , Logger  = winston.Logger
  , Console = winston.transports.Console;

var appLog = new Logger({
  transports: [
    new Console({
      level: 'info'
    , colorize: true
    , timestamp: function () {
        return 'App';
      }
    })
  ]
});

appLog.data = function (data) {
  JSON.stringify(data, null, '  ').split(/\n/).map(appLog.info);
};

var socketsLog = new Logger({
  transports: [
    new Console({
      level: 'warn'
    , colorize: true
    , timestamp: function () {
        return 'Sockets';
      }
    })
  ]
});

var expressLog = new Logger({
  transports: [
    new Console({
      level: 'warn',
      colorize: true,
      timestamp: function () {
        return 'Express';
      }
    })
  ]
});

// winston.handleExceptions(
//   new Console({
//     level: 'debug',
//     colorize: true,
//     timestamp: function () {
//       return 'App';
//     }
//   })
// );

var expressStream = {
  write: function (str) {
    expressLog.info(str);
  }
};

function logError(err) {
  if (err) {
    winston.loggers.get('app').error(err);
  }
}

module.exports = {
  express: expressLog
, app: appLog
, sockets: socketsLog
, logError: logError
, expressStream: expressStream
};
