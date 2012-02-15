var fs = require('fs');
var outbound = require('./outbound');
var async = require('async');

exports.hook_queue = function(next, connection) {
	var plugin = this;
	var lines = connection.transaction.data_lines;
	if (lines.length === 0) {
		return next(DENY);
	}
	
	var members = [
		'elad.benisrael@gmail.com',
		'nirsanirsa@gmail.com',
		'syahalom@gmail.com',
		'daniel.grumer@gmail.com'
	];

	var from = 'test@monkeytell.com';

	var contents = connection.transaction.data_lines.join('');
	return async.forEach(members, function(to, cb) {

		plugin.loginfo('sending mail to: ' + to);

		outbound.send_email(from, to, contents, function(code, msg) {
			switch (code) {
				case DENY:
					plugin.logerror("sending mail failed: " + msg);
					break;

				case OK:
					plugin.loginfo("mail sent");
					break;

				default:
					plugin.logerror("unrecognised return code from sending email: " + msg);
			}

			return cb();
		});

	}, function(err) {
		plugin.loginfo('mail sent to all members');

		if (err) {
			plugin.logerror('error sending mail', err);
			return next(DENY);
		}
		
		return next(OK);
	});
};