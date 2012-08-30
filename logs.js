var winston = require('winston')
  , Logger  = winston.Logger
  , Console = winston.transports.Console;

var appLog = new Logger({
  transports: [
    new Console({
      level: 'info'
    , colorize: true
    })
  ]
});

appLog.data = function (data, name) {
  if (name) {
    appLog.debug(name + ':');
  }
  JSON.stringify(data, null, '  ').split(/\n/).map(appLog.debug);
};

var socketsLog = new Logger({
  transports: [
    new Console({
      level: 'error'
    , colorize: true
    , timestamp: function () {
        return 'socket.io';
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
        return 'express  ';
      }
    })
  ]
});

var expressStream = {
  write: function (str) {
    expressLog.info(str);
  }
};

module.exports = {
  express: expressLog
, app: appLog
, sockets: socketsLog
, expressStream: expressStream
};
