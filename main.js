var VER = 13;
console.log('starting version', VER);
var express = require('express');
var http = require('http');
var path = require('path');

//
// start http server
//

var server = express.createServer();
var girror = require('./connect-girror');

var listzz = require('./lib/api');
var pbt = girror('https://github.com/eladb/pbt');
var telobike = girror('https://github.com/eladb/telobike');

server.use(express.vhost('listzz.com', listzz));
server.use(express.vhost('pbt.listzz.com', pbt));
server.use(express.vhost('telobike.listzz.com', telobike));

// server.use(express.vhost('localhost', listzz));

server.listen(3000);
console.log('Listening on port 3000');

//
// start smtp server
//

var haraka = require('./lib/haraka');
var smtp = haraka(path.join(__dirname, 'haraka'));
smtp.start();

//
// start monitor
//

var monitor = require('./lib/monitor');
monitor.start();

//
// start deployment endpoint
//

var githubhook = require('githubhook');
var girror = require('girror');

var repo = 'https://github.com/eladb/monkeytell';

githubhook(8123, { 'secret': repo }, function (err, payload) {
  if (err) return console.error(err);

  return girror(repo, '/var/www', function(err) {
    if (err) return console.error(err);
    else return process.exit(1);
  });
});
