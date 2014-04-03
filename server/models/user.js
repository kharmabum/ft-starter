/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , crypto = require('crypto')
  , oAuthTypes = ['twitter'];

/**
 * User Schema
 */

var UserSchema = new Schema({
  name: { type: String, default: '' },
  email: { type: String, default: '' },
  username: { type: String, default: '' },
  provider: { type: String, default: '' },
  hashed_password: { type: String, default: '' },
  salt: { type: String, default: '' },
  authToken: { type: String, default: '' },
  twitter: {}
});

/**
 * Virtuals
 */

UserSchema
  .virtual('password')
  .set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashed_password = this.encryptPassword(password);
  })
  .get(function() { return this._password; });


/**
 * Pre-save hook
 */

UserSchema.pre('save', function(next) {
  if (this.isNew) {
    if (!validatePresenceOf(this.password) && !this.doesNotRequireValidation()) {
      next(new Error('Invalid password'));
    }
    // Fake OAuth 2.0 for ember-simple-auth
    var hashContent = this.username + this.password + Date.now() + Math.random();
    this.authToken = crypto.createHash('sha1').update(hashContent).digest('hex');
    next();
  }
  else {
    next();
  }
});

/**
 * Validations
 */

var validatePresenceOf = function (value) {
  return value && value.length;
};

// the below 5 validations only apply if you are signing up traditionally

// UserSchema.path('name').validate(function (name) {
//   if (this.doesNotRequireValidation()) return true;
//   return name.length;
// }, 'Name cannot be blank');

UserSchema.path('email').validate(function (email) {
  if (this.doesNotRequireValidation()) return true;
  return email.length;
}, 'Email cannot be blank');

UserSchema.path('email').validate(function (email, fn) {
  if (this.doesNotRequireValidation()) fn(true);
  var User = mongoose.model('User');
  // Check only when it is a new user or when email field is modified
  if (this.isNew || this.isModified('email')) {
    User.find({ email: email }).exec(function (err, users) {
      fn(!err && users.length === 0);
    });
  } else fn(true);
}, 'Email already exists');

UserSchema.path('username').validate(function (username) {
  if (this.doesNotRequireValidation()) return true;
  return username.length;
}, 'Username cannot be blank');

UserSchema.path('hashed_password').validate(function (hashed_password) {
  if (this.doesNotRequireValidation()) return true;
  return hashed_password.length;
}, 'Password cannot be blank');


/**
 * Methods
 */

UserSchema.methods = {

  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */

  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hashed_password;
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */

  makeSalt: function () {
    return Math.round((new Date().valueOf() * Math.random())) + '';
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */

  encryptPassword: function (password) {
    if (!password) return '';
    var encrypted;
    try {
      encrypted = crypto.createHmac('sha1', this.salt).update(password).digest('hex');
      return encrypted;
    } catch (err) {
      return '';
    }
  },

  /**
   * Validation is not required if using OAuth
   */

  doesNotRequireValidation: function() {
    return ~oAuthTypes.indexOf(this.provider);
  }
};

/**
 * Statics
 */

UserSchema.statics = {

  load: function (options, cb) {
    var criteria = options.criteria || {};
    var populate = options.populate || [];
    var select = options.select | '';

    this.findOne(criteria)
      .select(select)
      .populate(populate)
      .exec(cb);
  },

  list: function (options, cb) {
    var criteria = options.criteria || {};
    var sort = options.sort || { createdAt: -1 };
    var limit = options.limit === 0 ? 0 : (options.limit || 10);
    var page = options.page || 0;
    var populate = options.populate || [];
    var select = options.select || '';

    this.find(criteria)
      .select(select)
      .populate(populate)
      .sort(sort)
      .limit(limit)
      .skip(limit * page)
      .exec(cb);
  }
};

exports = module.exports = mongoose.model('User', UserSchema);
