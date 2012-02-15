var child_process = require('child_process');

// returns a `function(req, res)` which executes `child_process.spawn` with the provided
// arguments and pipes output to the http response. the response will terminate only after
// the program finished.
module.exports = function(program, args, options) {
	return function(req, res) {
		console.log('spawning with args:', program, args, options);

		res.writeHead(200, {'content-type':'text/plain'});

		var child = child_process.spawn.call(child_process, program, args, options);
					
		// pipe output to process stdout/err and response (if provided)
		child.stdout.pipe(res);
		child.stderr.pipe(res);
		child.stdout.pipe(process.stdout);
		child.stderr.pipe(process.stderr);

		child.on('error', function(err) {
			console.error('error spawning child process:', err);
			return res.end('error: ' + err.toString());
		});

		child.on('exit', function(code) {
			console.log('child exited with exit code', code);
			return res.end();
		});
	};
};