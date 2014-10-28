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
            req.originalUrl
  var response = {
    self: url,
    results: []
  };
  db.collection('data')
    .find({name: new RegExp('^' + req.params.food)})
    .toArray(function(err, data) {
      data.forEach(function(food) {
        delete food._id;
        response.results.push(food);
      });
      res
        .set({'Content-Type': 'application/json'})
        .send(JSON.stringify(response));
    });
});

app.get('*', function(req, res) {
  res
    .status(400)
    .send('No no no.')
    .end();
});

app.listen(config.app.port, config.app.ip);
