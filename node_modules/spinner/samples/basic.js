// basic.js

var request = require('request');
var spinner = require('../main').createSpinner();

spinner.start('lazykiller', function(err, port) {
	if (err) return console.error(err);

	request('http://localhost:' + port, function(err, res, body) {
		console.log('response:', body);
		//spinner.stopall();
	});
});
