var http = require('http');
var express = require('express');
var path = require('path');

var HTTP_PORT = process.env.HTTP_PORT || 5080;
var DEPS_PORT = process.env.DEPS_PORT || 5033;

var app = http.createServer(function(req, res) {
    res.end('email is back, baby v5');
});

app.listen(HTTP_PORT);
console.log('Listening on', HTTP_PORT);

//
// start smtp server
//

var haraka = require('./lib/haraka');
var smtp = haraka(path.join(__dirname, 'haraka'));
smtp.start();


//
// start deps server (git pull + kill)
//

var spawn = require('./lib/spawn');
var deps = express.createServer();
deps.post('/', spawn(path.join(__dirname, 'depl.sh'), [], { cwd: __dirname }));
deps.listen(DEPS_PORT);
console.log('deps listening on port', DEPS_PORT);