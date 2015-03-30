module.exports = {
  wordLength: wordLength,
  largest: largest,
  buildResponse: buildResponse
}

// EXPORTS
function wordLength(word) {
  return word.length;
}

function largest(a, b) {
  return (a > b) ? a : b;
}

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

// PRIVATE
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
