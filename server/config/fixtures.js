/**
 * Fixture data.
 */

var mongoose = require('mongoose');

// Load fixture data
var Person = mongoose.connection.model('Person');
Person.collection.remove(function(err) {
    if (err) throw err;

    //Convert object to array
    var data = [
      {
        name: 'Bianca',
        age: 15,
        gender: 'female',
        nicknames: 'Cruella',
      },
      {
        name: 'Desmond',
        age: 20,
        gender: 'male',
        nicknames: 'Des',
      },
      {
        name: 'Cosby',
        age: 11,
        gender: 'male',
        nicknames: 'Oz',
      }
    ];
    data.forEach(function(item) {
        var doc = new Person(item);
        Person.findOne({}, function (err, friend) {
          if (!err && friend) {
            doc.friends.push(friend);
          }
          doc.save();
        });

    });
});
