var qs = require('querystring');
module.exports = Helper;

function Helper() {}

Helper.wordLength = wordLength;
Helper.largest = largest;
Helper.buildResponse = buildResponse;

// EXPORTS
function wordLength(word) {
  return word.length;
}

function largest(a, b) {
  return (a > b) ? a : b;
}

function buildResponse(data, req) {
  // custom header set by api-proxy: https://github.com/damonmcminn/api-proxy
  var prefix = req.headers['api-proxy-prefix'];
  var page = Number(req.query.page);
  var totalFoods = data.total;
  var totalPages = Math.ceil(totalFoods/data.limit);
  
  var host = req.headers.host;
  var pathName = req._parsedUrl.pathname;
  var search = req.query.search;
  var words = Array.isArray(search) ? search : [(search || '')];
  var q = qs.stringify({search: words});

  var path = prefix ? `/${prefix}${pathName}?${q}` : `${pathName}?${q}`;
  var url = `${req.protocol}://${host}${path}`;

  return {
    links: generateLinks(url, page, totalPages),
    total_foods: totalFoods,
    total_pages: totalPages,
    foods: data.results
  };
}

// PRIVATE
function generateLinks(url, page, total) {
  var base = url + '&page=';
  var noPage = (page === 0 || Number.isNaN(page));

  var self = (noPage) ? url : (base + page);

  if (noPage) {
    page = 1;
  }

  var isValid = page <= total;
  var isNext = page < total;
  var isPrev = (page > 1) && (page <= total);

  var links = {};
  var urls = [
    {name: 'self', url: isValid ? self : false},
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
