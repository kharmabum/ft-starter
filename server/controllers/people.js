/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , Person = mongoose.model('Person');

/**
 * Middleware
 */

// attach objects from params, etc


/**
* Request handlers
 */

/**
 * Find all people.
 *
 * @returns {object} person
 */

// app.get('/api/people/', people.index);
exports.index = function(req, res, next) {
  Person.list({}, function(err, people) {
    if (err) return next(err);
    res.send({ person: people });
  });
};

/**
 * Find person by id.
 *
 * @returns {object} person
 */

// app.get('/api/people/:id', people.load);
exports.load = function(req, res, next) {
  Person.findById(req.params.id, function (err, person) {
    if (err) return next(err);
    if (!person) return next(new Error('not found'));
    res.send({ person: person });
  });
};

/**
 * Create new person.
 *
 * @param {object} person
 * @returns {object} person
 */

// app.post('/api/people', people.create);
exports.create = function(req, res, next) {
  Person.create(req.body.person, function (err, person) {
    if (err) return next(err);
    res.send({ person: person });
  });
};


/**
 * Update person by id.
 *
 * @param {string} id
 * @returns {object} person
 */

// app.put('/people/:id', people.update);
exports.update = function(req, res, next) {
  Person.findByIdAndUpdate(req.params.id, req.body.person, function(err, person) {
    if (err) return next(err);
    res.send({ person: person });
  });
};


/**
 * Delete person by id.
 *
 * @param {string} id
 * @returns 200 OK
 */

// app.del('/people/:id', people.destroy);
exports.destroy = function(req, res, next) {
  Person.findById(req.params.id).remove(function(err) {
    if (err) return next(err);
    res.send(200);
  });
};
