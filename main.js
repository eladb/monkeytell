var VER = 13;
console.log('starting version', VER);
var express = require('express');
var http = require('http');
var path = require('path');
var api = require('./lib/api');

//
// start api server
//

api.listen(3000);
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