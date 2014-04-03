var mongoose = require('mongoose')
  , LocalStrategy = require('passport-local').Strategy
  , TwitterStrategy = require('passport-twitter').Strategy
  , User = mongoose.model('User');


module.exports = function (passport, config) {

  // Serialize sessions
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });

  // Use local strategy
  passport.use(new LocalStrategy(function (email, password, done) {
    User.findOne({ email: email }, function (err, user) {
      if (err) return done(err);
      if (!user) return done(null, false, { message: 'Unknown user' });
      if (!user.authenticate(password)) return done(null, false, { message: 'Invalid password' });
      return done(null, user);
    });
  }));

  // Use twitter strategy
  passport.use(new TwitterStrategy({
      consumerKey: config.twitter.clientID,
      consumerSecret: config.twitter.clientSecret,
      callbackURL: config.twitter.callbackURL
    },
    function(token, tokenSecret, profile, done) {
      User.findOne({ 'twitter.id_str': profile.id }, function (err, user) {
        if (err) { return done(err); }
        if (!user) {
          user = new User({
            name: profile.displayName,
            username: profile.username,
            provider: 'twitter',
            twitter: profile._json
          });
          user.save(function (err) {
            if (err) console.log(err);
            return done(err, user);
          });
        }
        else {
          return done(err, user);
        }
      });
    }
  ));
};
