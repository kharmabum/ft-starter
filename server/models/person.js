
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , createdModifiedPlugin = require('mongoose-createdmodified').createdModifiedPlugin;

/**
 * Getters
 */

var getNicknames = function (nicknames) {
  return nicknames.join(',');
};

/**
 * Setters
 */

var setNicknames = function (nicknames) {
  return nicknames.split(',');
};

/**
 * Person Schema
 */

var PersonSchema = new Schema({
  name: {
    type : String,
    default : '',
    trim : true
  },
  age: Number,
  gender: {
      type: String,
      default : 'unspecified',
      enum: ['male', 'female', 'unspecified'],
  },
  nicknames: {
    type: [],
    get: getNicknames,
    set: setNicknames
  },
  friends: [{
    type: Schema.Types.ObjectId,
    ref: 'Person'
  }]
});

/**
 * Virtuals
 */

PersonSchema.virtual('friendCount').get(function(){
    return this.friends.length;
});

// Ensure virtuals are serialised.
PersonSchema.set('toJSON', {virtuals: true});
PersonSchema.set('toObject', {virtuals: true});


/**
 * Plugins
 */

PersonSchema.plugin(createdModifiedPlugin, {index: true});


/**
 * Validations
 */

PersonSchema.path('name').required(true, 'Person name cannot be blank');


/**
 *  Hooks
 */

 PersonSchema.pre('remove', function (next) {
   console.log('Goodbye, ' + this.name);
   next();
 });

/**
 * Methods
 */

Schema.methods = {

  giveTitle: function (title, cb) {
    this.name = title + " " + this.name;
    this.save(cb);
  }
};

/**
 * Statics
 */

PersonSchema.statics = {

  load: function (options, cb) {
    var criteria = options.criteria || {};
    var populate = options.populate || [];
    var select = options.select || '';

    this.findOne(criteria)
      .select(select)
      .populate(populate)
      .exec(cb);
  },

  // use to create custom statics (like 'retired/deleted')
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

exports = module.exports = mongoose.model('Person', PersonSchema);
