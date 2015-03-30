'use strict';

var app = require('express')();
var db = require('./db');
var helper = require('./helper');
var wordLength = helper.wordLength;
var largest = helper.largest;
var buildResponse = helper.buildResponse;

module.exports = app;

app.enable('trust proxy');

app.get('/:food', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  var words = (req.params.food).split('-');
  var search = {
    words: words,
    page: Number(req.query.page)
  };

  var longestWordLength = words.map(wordLength).reduce(largest);
  var minLength = 3;
  var tooShort = `Searches must be minimum of ${minLength} characters`;
  if (longestWordLength < minLength) {
    return res.status(400).json({message: tooShort});
  }

  db.logRequest({ip: req.ip, search: req.url});

  db.findFood(search, function(err, data) {
    res.json(buildResponse(data, req));
  });
});
