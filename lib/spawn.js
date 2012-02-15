var child_process = require('child_process');

// returns a `function(req, res)` which spawns the program
// `program` as a child process (with `options`) and emits stdout/stderr
// into response.
module.exports = function() {
	var spawn_args = [];
	for (var i in arguments) spawn_args.push(arguments[i]);
	return function(req, res) {
		console.log('spawning with args:', spawn_args);
		var child = child_process.spawn.apply(child_process, spawn_args);
		res.writeHead(200, {'content-type':'text/plain'});
		child.on('error', function(err) {
			console.error('error spawning', err);
			return res.end('error: ' + err.toString());
		});
		child.stdout.pipe(res);
		child.stderr.pipe(res);
		child.on('exit', function(code) {
			console.log('exit', code);
			return res.end();
		});
	};
}