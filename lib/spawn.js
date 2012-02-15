var child_process = require('child_process');

// returns a `function(req, res)` which executes `child_process.spawn` with the provided
// arguments and pipes output to the http response. the response will terminate only after
// the program finished. use `background: timeout` to run the program in the background after
// waiting 'timeout' milliseconds (and end the http response immediately).
module.exports = function(program, args, options) {
	return function(req, res) {
		console.log('spawning with args:', program, args, options);

		function _spawn(res) {
			var child = child_process.spawn.call(child_process, program, args, options);
						
			// pipe output to process stdout/err and response (if provided)
			if (res) child.stdout.pipe(res);
			if (res) child.stderr.pipe(res);
			child.stdout.pipe(process.stdout);
			child.stderr.pipe(process.stderr);

			child.on('error', function(err) {
				console.error('error spawning child process:', err);
				if (res) return res.end('error: ' + err.toString());
			});

			child.on('exit', function(code) {
				console.log('child exited with exit code', code);
				if (res) return res.end();
			});
		}

		res.writeHead(200, {'content-type':'text/plain'});

		// wait 'background' milliseconds and only spawn the child process without
		// binding to the response object.
		if (options.background) {
			// terminate the response first
			res.end('starting in ' + options.background + ' milliseconds');

			// spawn without a response object
			return setTimeout(function() { return _spawn(null); }, options.background);
		}
		else {
			// spawn with a response object ("foreground")
			return spawn(res);
		}
	};
};