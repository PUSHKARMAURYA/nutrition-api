'use strict';

var app = require('express')();
var db = require('./db');

module.exports = app;

app.enable('trust proxy');

app.get('/:food', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  var words = (req.params.food).split('-');
  var search = {
    words: words,
    page: Number(req.query.page)
  };

  db.findFood(search, function(err, data) {
    res.json(buildResponse(data, req));
  });
});

function buildResponse(data, req) {
  var page = Number(req.query.page) || 1;
  var totalFoods = data.total;
  var totalPages = Math.ceil(totalFoods/data.limit);

  var host = req.headers.host;
  var path = req._parsedUrl.pathname;
  var url = `${req.protocol}://${host}${path}`;

  return {
    links: generateLinks(url, page, totalPages),
    total_foods: totalFoods,
    total_pages: totalPages,
    foods: data.results
  };
}

function generateLinks(url, page, total) {
  var base = url + '?page=';
  var isValid = page <= total;
  var isNext = page < total;
  var isPrev = (page > 1) && (page <= total);

  var links = {};
  var urls = [
    {name: 'self', url: isValid ? (base + page) : false},
    {name: 'next', url: isNext ? (base + (page + 1)) : false},
    {name: 'prev', url: isPrev ? (base + (page - 1)) : false}
    ]
    .filter(function(link) {
      return link.url;
    })
    .forEach(function(link) {
      links[link.name] = link.url;
    });

  return links;
}
