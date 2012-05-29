console.log('starting a');
console.error('this is an error. env:', process.env.myenv);
var http = require('http');
http.createServer(function(req, res) {
	if (process.env.myenv) res.end('this is a sample app: ' + process.env.myenv);
	else res.end('B');
}).listen(process.env.PORT, function(err) {
	if (err) return console.error(err);
	return console.info('started on port ' + process.env.PORT);
});
