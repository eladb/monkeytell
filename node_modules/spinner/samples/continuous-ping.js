var spinner = require('..');
var request = require('request');
var ctxconsole = require('ctxobj').console;
var logule = require('logule');

logule.suppress('trace');
//logule.suppress('debug');

logule = ctxconsole(logule);

var portalloc = spinner.staticports({ range: [ 6000, 6010 ] });
var manager = spinner.createSpinner({ portalloc: portalloc, logger: logule });

function ping(app) {
	return manager.start(app, function(err, port) {
		var url = 'http://localhost:' + port;
		return request(url, function(err, res, body) {
			if (err) logule.error(err);
			else logule.info(res.statusCode, body);

			return setTimeout(function() { return ping(app); }, 100);
		});
	});
};

ping('myapp');
ping('lazykiller');
