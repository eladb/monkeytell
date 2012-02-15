var http = require('http');
var HTTP_PORT = process.env.HTTP_PORT || 5080;
var SMTP_PORT = process.env.SMTP_PORT || 5025;
var DEPS_PORT = process.env.DEPS_PORT || 5033;
var spawn = require('child_process').spawn;
var express = require('express');

var app = http.createServer(function(req, res) {
    res.end('email is back, baby v3');
});


var smtp = http.createServer(function(req, res) {
    res.end('smtp');
});

app.listen(HTTP_PORT);
smtp.listen(SMTP_PORT);

console.log('Listening on', HTTP_PORT, 'and', SMTP_PORT);

var deps = express.createServer();
deps.post('/', function(req, res) {
	var depl = spawn('./depl.sh');
	res.writeHead(200, {'content-type':'text/plain'});
	depl.stdout.pipe(res);
	depl.stderr.pipe(res);
	depl.on('exit', function(code) {
		console.log('exit', code);
		res.end();
	});
});
deps.listen(DEPS_PORT);
console.log('deps listening on port', DEPS_PORT);