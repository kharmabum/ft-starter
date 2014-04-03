
var users = require('../controllers/users')
  , people = require('../controllers/people')
  , _ = require('underscore')
  , auth = require('./middlewares/authorization');

/* Expose routes */

module.exports = function (app, passport) {

  /* Passport Local */

  app.post('/token', passport.authenticate('local', { failureRedirect: '#/login' }), users.authCallback);
  app.post('/signup', users.signup);
  app.get('/logout', users.logout);

  /* Passport Twitter */

  app.get('/auth/twitter', passport.authenticate('twitter'));
  app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '#/login' }), users.authCallback);

  /* API */

  // People

  app.get('/api/people', people.index);
  app.get('/api/people/:id', people.load);
  app.post('/api/people', people.create);
  app.put('/api/people/:id', people.update);
  app.del('/api/people/:id', people.destroy);

};
