'use strict';

var m = require('mongodb');
var async = require('async');
var logger = require('./logger');

var db;

m.MongoClient.connect(process.env.MONGO_URL, function(err, database) {
  if (err) {
    logger.error(err);
  }

  db = database;
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


function findFood(search, callback) {
  // search === {words: Array, page: Number}
  var query = buildQuery(search.words);
  var page = search.page || 1;
  var limit = 30;
  var projection = {
    _id: false,
    ndb_id: false
  };

  if (search.source) {
    query['source.organisation'] = search.source;
  }
  
  async.waterfall([
    function(cb) {
      // cb -> err, Number
      db.collection('food')
        .find(query)
        .count(cb);
    },
    function(total, cb) {
      // cb -> null, Number
      var skip = (page > 1) ? (page - 1) * limit : 0;
      cb(null, skip, total);
    },
    function(skip, total, cb) {
      db.collection('food')
        .find(query, projection)
        .sort({name: 1})
        .skip(skip)
        .limit(limit)
        .toArray(function(err, docs) {
          var data = {
            results: docs,
            total: total,
            page: page,
            limit: limit
          };
          cb(err, data);
        });
    }
  ], function(err, data) {
    callback(err, data);
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
