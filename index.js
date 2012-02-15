var http = require('http');
var express = require('express');
var path = require('path');

var HTTP_PORT = process.env.HTTP_PORT || 5080;
var SMTP_PORT = process.env.SMTP_PORT || 5025;
var DEPS_PORT = process.env.DEPS_PORT || 5033;

var app = http.createServer(function(req, res) {
    res.end('email is back, baby v3');
});


var smtp = http.createServer(function(req, res) {
    res.end('smtp');
});

app.listen(HTTP_PORT);
smtp.listen(SMTP_PORT);

console.log('Listening on', HTTP_PORT, 'and', SMTP_PORT);

//
// start deps server
//

var spawn = require('./lib/spawn');
var deps = express.createServer();
deps.post('/', spawn(path.join(__dirname, 'depl.sh'), { cwd: __dirname }));
deps.listen(DEPS_PORT);
console.log('deps listening on port', DEPS_PORT);
