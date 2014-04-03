/*
 * Launch and expose app
 */

module.exports = function (target) {

  var express = require('express')
  , fs = require('fs')
  , mongoose  = require('mongoose')
  , passport  = require('passport');

  /* Load config */

  var env = process.env.NODE_ENV || 'development'
    , config = require('./config/config')[env];

  config.gruntTarget = target;

  /* Mongoose config */

  function connect() {
    var options = { server: { socketOptions: { keepAlive: 1, auto_reconnect: true } } };
    mongoose.connect(config.db, options);
  }
  connect();

  // Error handler
  mongoose.connection.on('error', function (err) {
    console.log('Mongoose Connection Error: ' + err);
  });

  // Reconnect when closed
  mongoose.connection.on('disconnected', function () {
    connect();
  });

  /* Models */

  var models_path = __dirname + '/models';
  fs.readdirSync(models_path).forEach(function (file) {
    if (~file.indexOf('.js')) require(models_path + '/' + file);
  });

  /* Load fixture data */

  // mongoose.connection.once('open', function() {
  //   require('./config/fixtures.js');
  // });

  /* Passport config */

  require('./config/passport')(passport, config);

  /* Express config */

  var app = express();
  require('./config/express')(app, config, passport);

  /* Routes */

  require('./config/routes')(app, passport);

  /* Launch server */

  var port = process.env.PORT || 3000;
  app.listen(port);
  console.log('Express app started on port '+port);



  return app;
}
