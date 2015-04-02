'use strict';

var app = require('express')();
var db = require('./db');
var helper = require('./helper');
var wordLength = helper.wordLength;
var largest = helper.largest;
var buildResponse = helper.buildResponse;

module.exports = app;

app.enable('trust proxy');

app.get('/food', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  var search = req.query.search;
  // search could be ['foo', 'bar'], 'foo', undefined
  var words = Array.isArray(search) ? search : [(search || '')];
  var query = {
    words: words,
    page: Number(req.query.page)
  };

  var longestWordLength = words.map(wordLength).reduce(largest);
  var minLength = 3;
  var tooShort = `Searches must be minimum of ${minLength} characters`;
  var badPageNumber = `${req.query.page} is not a page number`;
  if (longestWordLength < minLength) {
    return res.status(400).json({message: tooShort});
  } else if (req.query.page && ((query.page < 1) || Number.isNaN(query.page))) {
    return res.status(400).json({message: badPageNumber});
  }

  db.logRequest({ip: req.ip, search: req.url});

  db.findFood(query, function(err, data) {
    res.json(buildResponse(data, req));
  });
});
