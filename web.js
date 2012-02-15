var http = require('http');


var app = http.createServer(function(req, res) {
    res.end('email is back, baby');
});

app.listen(process.env.PORT || 5000);

