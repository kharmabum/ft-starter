/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , User = mongoose.model('User')
  , utils = require('../lib/utils');

/**
 * Passport Local
 */

exports.authCallback = function (req, res) {
    if (req.user) res.send({ access_token: req.user.authToken });
    else res.send(404, 'Incorrect username or password.');
};

exports.signup = function (req, res) {
  if (!req.body.username) {
    return res.send(400, 'Username cannot be blank.');
  }

  if (!req.body.email) {
    return res.send(400, 'Email cannot be blank.');
  }

  if (!req.body.password) {
    return res.send(400, 'Password cannot be blank.');
  }

  if (req.body.password !== req.body.confirmPassword) {
    return res.send(400, 'Passwords do not match.');
  }

  var user = new User({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    provider: 'local'
  });

  user.save(function(err) {
    if (err) return res.send(500, err.message);
    res.send(200);

    // // manually login the user once successfully signed up
    // req.logIn(user, function(err) {
    //   if (err) return next(err)
    //   return res.redirect('/')
    // })
  });
};

exports.logout = function (req, res) {
  req.logout();
  res.send(200);
};



