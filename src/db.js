var m = require('mongodb');
var logger = require('./logger');
var host = process.env.NUTRITION_MONGO_HOST || 'localhost';
var port = process.env.NUTRITION_MONGO_PORT || 27017;
var nutritionDb = process.env.NUTRITION_DATABASE || 'nutrition';

var mongoServer = new m.Server(host, port);
var client = new m.MongoClient(mongoServer);
var db = client.db(nutritionDb);

client.open(function(err, conn) {
  if (err) {
    logger.error(err);
  } else {
    logger.info(conn);
  }
});


function buildQuery(words) {
  // words is an array
  var query = words.map(function(word) {
      return {
        name: {
          '$regex': word,
          '$options': 'i',
        }
      }
    });

  return {'$and': query};
}


function integerOrDefault(num, default) {
  // MongoDB skip/limit are ignored (all docs) if arg is not Number
  return Number.isInteger(num) ? num : default;
}


function findFood(search, callback) {
  // {words: Array, skip: Number, limit: Number}
  var query = buildQuery(search.words);
  var skip = integerOrDefault(search.skip, 0);
  var limit = integerOrDefault(search.limit, 1);
  var projection = {
    _id: false,
    ndb_id: false
  };

  if (search.source) {
    query['source.organisation'] = search.source;
  }
  
  db.collection('food')
    .find(query, projection)
    .sort({name: 1})
    .skip(skip)
    .limit(limit)
    .toArray(function(err, docs) {
      callback(err, docs);
    });
}

function logRequest(log, callback) {
  // log = {ip, search}
  // callback is optional

  log.timestamp = new Date();

  db.collection('requests').insert(log, function(err, doc) {
    if (callback) {
      callback(err, doc);
    }
  });
}


module.exports = {
  findFood: findFood,
  logRequest: logRequest,
};
