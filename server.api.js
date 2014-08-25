var User = require('./models/user.js');
var Event = require('./models/event.js');

// API CALLBACKS 

exports.listUsers = function(req, res) {
  User.find()
  .sort('name')
  .exec(function(err, users){
    if(err)
      res.send({error: err});
    else
      res.send(users);
  });
};

exports.getUser = function(req, res) {
  User.findById(req.params.id, req.body, function (err, user) {
    if (err)
      res.send({error: err});
    else
      res.send(user);
  });
};

exports.createUser = function(req, res) {
  var user = new User({
    name: req.body.name,
    lastName: req.body.lastName,
    username: req.body.username,
    email: req.body.email,
    created: new Date(),
    status: 'temporary',
    score: 0,
    notifications: [],
    description: req.body.description
  });

  user.save(function (err) {
    if (err)
      res.send({error: err});
    else
      res.send({});
  });
};

exports.updateUser = function(req, res) {
  User.findByIdAndUpdate(req.params.id, req.body, function (err) {
    if (err)
      res.send({error: err});
    else
      res.send({});
  });
};

exports.removeUser = function(req, res) {
  User.findByIdAndRemove(req.params.id, function (err) {
    if (err)
      res.send({error: err});
    else
      res.send({});
  });
};

// EVENTS

exports.events = function(req, res) {
  var threshold = new Date();
  threshold.setDate(threshold.getDate()-5);

  Event.find()
  // .where('date').gt(threshold)
  .sort('-date')
  .exec(function(err, events){
    res.send(events);
  });
};


/* DO NOT REMOVE THIS FUNCTION */

// API ROUTE LIST
exports.getRoutes = function () {
  return {
    get: {
      '/api/users': [ exports.listUsers ],    // array of callbacks for the api route
      '/api/users/:id': [ exports.getUser ],
      '/api/events': [ exports.events ]
    },
    post: {
      '/api/users': [ exports.createUser ]
    },
    put: {
      '/api/users/:id': [ exports.updateUser ]
    },
    'delete': {
      '/api/users/:id': [ exports.removeUser ]
    }
  };
};
