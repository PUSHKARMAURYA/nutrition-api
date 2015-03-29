var app = require('src/app');
var port = process.env.NUTRITION_PORT || 50000;
var host = process.env.NUTRITION_HOST || '127.0.0.1';

app.listen(port, host);
