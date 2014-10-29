var app = require('express')();
var Mongo = require('mongodb');
var config = require(__dirname + '/config/config.js');

var mongoClient = new Mongo.MongoClient(
  new Mongo.Server(config.db.host, config.db.port)
);
var db = mongoClient.db(config.db.name);


// open connection to mongo
mongoClient.open(function(err, mongoClient) {
  if (err) {
    console.log(err);
  }
});

app.get('/v1/food/:food', function(req, res) {
  var url = req.protocol + '://' +
            req.headers.host +
            req.originalUrl;
  var response = {
    total_foods: null,
    self: url,
    foods: []
  };

  var food;
  if (req.query.type === 'all') {
    food = req.params.food;
  } else {
    food = '^' + req.params.food;
  }

  db.collection('data')
    .find({name: new RegExp(food)}, {_id: false})
    .toArray(function(err, data) {
      response.total_foods = data.length;
      data.forEach(function(food) {
        response.foods.push(food);
      });
      res
        .set({'Content-Type': 'application/json'})
        .status(200)
        .send(JSON.stringify(response));
    });
});

//app.get('/v1/id/:id

app.get('*', function(req, res) {
  res
    .status(404)
    // render link to github readme
    .send('No no no.')
    .end();
});

app.listen(config.app.port, config.app.ip);
