var http = require('http');
var HTTP_PORT = process.env.HTTP_PORT || 5080;
var SMTP_PORT = process.env.SMTP_PORT || 5025;

var app = http.createServer(function(req, res) {
    res.end('email is back, baby v2');
});


var smtp = http.createServer(function(req, res) {
    res.end('smtp');
});

app.listen(HTTP_PORT);
smtp.listen(SMTP_PORT);

console.log('Listening on', HTTP_PORT, 'and', SMTP_PORT);

