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
app.all('/nutrition/food', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});
app.get('/nutrition/food', function(req, res) {
  res.set({'Content-Type': 'application/json'})
  var protocol = (req.headers.host.search(/localhost/) < 0) ?
    'https' : req.protocol;
  var url = protocol + '://' +
            req.headers.host +
            req.originalUrl;
  var baseUrl = url.slice(0, url.indexOf('?') + 1);
            
  var response = {
    links: {
      self: null,
      next: null,
      prev: null
    },
    total_foods: null,
    foods: []
  };

  var query = {};
  if (req.query.name !== undefined) {
    var singleWord = (req.query.name.match(':') === null);
    var matchStart = (req.query.match_start === 'true');

    if (req.query.name.length < 1) {
      response.error = 'Searches must be at least 1 character or more.';
      res.status(400).send(JSON.stringify(response));
    } else if (singleWord && matchStart) {
      query.name = {
        $regex: '^' + req.query.name,
        $options: 'i',
      };
    } else {
      query.$and = [];
      req.query.name.split('-').forEach(function(word) {
        query.$and.push({
          name: {
            $regex: word,
            $options: 'i',
          }
        });
      });
    }
  } else {
    // ALL RESULTS RETURNED
    var msg = 'No food defined. Visit https://github.com/damonmcminn/nutrition-api for instructions on use';
    res.set({'Content-Type': 'application/json'});
    res.status(404).send(JSON.stringify(msg)).end();
  }

  if (!res.headersSent) {
    var projection = {
      _id: false,
      ndb_id: false,
    };

    /* pagination limit */
    var limit = 30;
    var pageNum = req.query.page || 1;
    var stop = limit*pageNum;
    var start = limit*(pageNum-1);

    db.collection('food')
      .find(query, projection)
      .sort({name: 1})
      // use .each -- why build array then iterate it?
      .toArray(function(err, data) {
        if (err) throw err;
        var totalPages = Math.ceil(data.length/limit);
        response.total_foods = data.length;
        response.total_pages = totalPages;

        if (req.query.page) {
          response.links.self = url;
        } else if (totalPages === 0) {
          response.links.self = url;
        } else {
          response.links.self = url + '&page=' + pageNum;
        }
        if (pageNum < totalPages) {
          response.links.next = baseUrl + 'name=' + req.query.name + '&page=' + (Number(pageNum) + 1);
        } else {
          delete response.links.next;
        }
        if ((pageNum - 1) === 0) {
          delete response.links.prev;
        } else {
          response.links.prev = baseUrl + 'name=' + req.query.name + '&page=' + (Number(pageNum) - 1);
        }

        data.slice(start, stop).forEach(function(food) {
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
          search: req.query.name
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
  var msg = 'Bad request. Visit https://github.com/damonmcminn/nutrition-api for instructions on use';
  res.set({'Content-Type': 'application/json'});
  res.status(404).send(JSON.stringify(msg)).end();
});

app.listen(config.app.port, config.app.ip);
