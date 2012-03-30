var path = require('path');
var spawn = require('child_process').spawn;

module.exports = function(configDir) {
	var haraka = null;
	var api = {};

	// starts a haraka server
	api.start = function() {
		if (haraka) return; // already started

		var prog = path.join(__dirname, '..', 'node_modules', '.bin', 'haraka');
		console.log('starting', prog);
		haraka = spawn(prog, ['-c', configDir]);

		haraka.on('exit', function(code) {
			console.warn('haraka server exited with code ' + code + '. respawning');
			haraka = null;
			return api.start();
		});

		haraka.on('error', function(err) {
			console.error('error spawning haraka server');
			haraka = null;
		});

		// pipe stdout/stderr to parent process
		haraka.stdout.pipe(process.stdout);
		haraka.stderr.pipe(process.stderr);
	}

	// stops a haraka server
	api.stop = function() {
		if (!haraka) return; // already stopped
		haraka.removeAllListeners('exit');
		haraka.removeAllListeners('error');
		haraka.kill();
	};

	return api;
};
