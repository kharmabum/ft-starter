/* Module dependencies */

var express = require('express')
  , mongoStore = require('connect-mongo')(express)
  , winston = require('winston')
  , lockFile = require('lockfile')
  , fs = require('fs')
  , path = require('path');

var env = process.env.NODE_ENV || 'development';

module.exports = function (app, config, passport) {

  /* Debugging */

  app.set('showStackError', true);

  app.configure('development', function () {
    app.use(lock);
    app.use(require("connect-livereload")());
  });

  /* Logging */

  var log;
  if (env !== 'development') {   // Use winston on production
    log = {
      stream: {
        write: function (message, encoding) {
          winston.info(message);
        }
      }
    };
  } else {
    log = 'dev';
  }
  app.use(express.logger(log));

  /* Static assets */

  app.use(express.compress());
  app.use(express.favicon());

  // `expressServer:debug`
  if (config.gruntTarget === 'debug') {

    // Simulate `copy:assemble` task
    app.use(static({ urlRoot: '/config', directory: 'config' }));
    app.use(static({ urlRoot: '/vendor', directory: 'vendor' }));
    app.use(static({ directory: 'public' }));

    app.use(static({ urlRoot: '/tests', directory: 'tests' })); // For test-helper.js and test-loader.js
    app.use(static({ directory: 'tmp/result' }));
  } else {

    // `expressServer:dist`, production
    app.use(static({ directory: 'dist' }));
  }

  /* Session storage */

  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());

  // Express/Mongo session storage
  app.use(express.session({
    secret: 'SECRET',
    store: new mongoStore({
      url: config.db,
      collection : 'sessions'
    })
  }));

  // Use passport session
  app.use(passport.initialize());
  app.use(passport.session());


  /* Routes */

  app.use(app.router);

  /* Error handling */

  app.use(function(err, req, res, next){

    // Treats "not found" in the error msg as 404.
    if (err.message
      && (~err.message.indexOf('not found')
      || (~err.message.indexOf('Cast to ObjectId failed')))) {
        return next();
    }

    console.error(err.stack);
    res.send(500, { error: 'Something blew up!' });
  });

  // assume 404 since no middleware responded
  app.use(function(req, res, next){
    res.send(404, { error: 'Resource not found.' });
  });

  app.configure('development', function () {
    app.locals.pretty = true;
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  });
};


// Works with grunt tasks/locking.js
function lock(req, res, next) {
  (function retry() {
    if (lockFile.checkSync('tmp/connect.lock')) {
      setTimeout(retry, 30);
    } else { next(); }
  })();
}

// Gotta catch 'em all (and serve index.html)
function static(options) {
  return function(req, res, next) {
    var filePath = "";
    if (options.directory) {
      var regex = new RegExp('^' + (options.urlRoot || ''));
      // URL must begin with urlRoot's value
      if (!req.path.match(regex)) { next(); return; }
      filePath = options.directory + req.path.replace(regex, '');
    }
    else if (options.file) {
      filePath = options.file;
    }
    else {
      throw new Error('static() isn\'t properly configured!');
    }

    fs.stat(filePath, function(err, stats) {
      if (err) { next(); return; } // Not a file, not a folder => can't handle it

      if (options.ignoredFileExtensions) {
        if (options.ignoredFileExtensions.test(req.path)) {
          res.send(404, {error: 'Resource not found'});
          return; // Do not serve index.html
        }
      }

      // Is it a directory? If so, search for an index.html in it.
      if (stats.isDirectory()) { filePath = path.join(filePath, 'index.html'); }

      // Serve the file
      res.sendfile(filePath, function(err) {
        if (err) { next(); return; }
      });
    });
  };
}
