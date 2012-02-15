// returns a `function(req, res)` which spawns the program
// `program` as a child process (with `options`) and emits stdout/stderr
// into response.
module.exports = function(program, options) {
	var child_process = require('child_process');
	return function(req, res) {
		var child = child_process.spawn(program, options);
		res.writeHead(200, {'content-type':'text/plain'});
		child.stdout.pipe(res);
		child.stderr.pipe(res);
		child.on('exit', function(code) {
			console.log('exit', code);
			res.end();
		});
	};
}