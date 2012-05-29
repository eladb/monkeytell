// options.js

var request = require('request');
var spinner = require('../main').createSpinner();

var options = {

	// name of child. Basically a key used to identify the child process
	name: 'foofoo',
	
	// program to execute (default is `process.execPath`, which is node.js)
	command: process.execPath,

	// array of arguments to use for spawn
	args: [ './myapp.js' ],

	// environment variables for spawned process
	env: { myenv: '1234' },

	// working directory to spawn the app (default null)
	cwd: null,

	// logger to use (default is `console`)
	logger: console,

	// timeout in seconds waiting for the process to bind to the allocated port (default is 5 seconds)
	timeout: 5,

	// number of attempts to start the process. After this, spinner will not fail on every `start` request unless a `stop` is issued (default is 3).
	attempts: 3,

	// timeout in seconds to wait for a child to stop before issuing a SIGKILL (default is 30 sec)
	stopTimeout: 30,

	// path of file or directory to monitor for changes. When the monitor indicates a change, the child will be restarted. Default is null (no monitor).
	// file must exist when the child is first started.
	monitor: './lazykiller.js',

	// stream to pipe process stdout to (default is null)
	stdout: process.stdout,

	// stream to pipe process stderr to (default is null)
	stderr: process.stderr,

	// port range to use for child processes. note that two spinner
	// objects cannot share a port range because of a race between
	// finding an available port and actually binding it by the app.
	range: [ 7000, 7999 ],
};

spinner.start(options, function(err, port) {
	if (err) return console.error(err);

	request('http://localhost:' + port, function(err, res, body) {
		console.log('response:', body);
	});
});
