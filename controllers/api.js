var User = require('../models/user.js');
var Event = require('../models/event.js');

exports.users = function(req, res) {
  User.find()
  .where('state').equals('active')
  .sort('-score')
  .exec(function(err, users){
    res.send(users);
  });
};

exports.user = function(req, res) {
  User.findOne({username: req.params.username}, function(err, users){
    res.send(users);
  });
};

exports.events = function(req, res) {
  var threshold = new Date();
  threshold.setDate(threshold.getDate()-5);

  Event.find()
  .where('date').gt(threshold)
  .sort('-date')
  .exec(function(err, events){
    res.send(events);
  });
};
