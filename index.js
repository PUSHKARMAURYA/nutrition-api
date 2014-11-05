var app = require('express')();
var Mongo = require('mongodb');
var config = require(__dirname + '/config/config.js');
var jade = require('jade');
var dns = require('dns');

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

app.enable('trust proxy');
app.get('/food', function(req, res) {
  res.set({'Content-Type': 'application/json'})
  var url = req.protocol + '://' +
            req.headers.host +
            req.originalUrl;
  var response = {
    self: url,
    total_foods: null,
    foods: []
  };

  var query = {};
  if (req.query.name !== undefined) {
    var singleWord = (req.query.name.match(':') === null);
    var matchStart = (req.query.match_start === 'true');

    if (req.query.name.length < 3) {
      response.error = 'Searches must be 3 characters or greater.';
      res
        .status(400)
        .send(JSON.stringify(response));
    } else if (singleWord && matchStart) {
      query.name = {
        $regex: '^' + req.query.name,
      };
    } else {
      query.$and = [];
      req.query.name.split('-').forEach(function(word) {
        query.$and.push({name: {$regex: word}});
      });
    }
  } else {
    // ALL RESULTS RETURNED
  }

  if (!res.headersSent) {
    var fields = {_id: false};
    var options = {limit: req.query.pagination, skip: 0};
    // make cursor here
    db.collection('food')
      .find(query, fields)
      // use .each -- why build array then iterate it?
      .toArray(function(err, data) {
        if (err) throw err;
        response.total_foods = data.length;
        data.forEach(function(food) {
          response.foods.push(food);
        });
        res
          .status(200)
          .send(JSON.stringify(response));
      });
  }

  dns.reverse(req.ip, function(err, data) {
      db.collection('requests').insert(
        {
          timestamp: new Date(),
          ip: req.ip,
          reverseDNS: data[0],
          request: response.self
        },
        function(err, data) {
          if (err) {
            console.error(err);
          }
        }
      );
  });
});

app.get('*', function(req, res) {
  res
    .status(404)
    .send(jade.renderFile(
      __dirname + '/views/usage.jade',
      {url: req.protocol + '://' + req.headers.host}
    ))
    .end();
});

app.listen(config.app.port, config.app.ip);
