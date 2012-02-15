var http = require('http');

var app = http.createServer(function(req, res) {
    res.end('email is back, baby');
});

app.listen(process.env.HTTP_PORT || 5080);

var smtp = http.createServer(function(req, res) {
    res.end('smtp');
});

smtp.listen(process.env.SMTP_PORT || 5025);
