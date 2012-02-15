var fs = require('fs');
var outbound = require('./outbound');

exports.hook_queue = function(next, connection) {
	var lines = connection.transaction.data_lines;
	if (lines.length === 0) {
		return next(DENY);
	}
		
	var plugin = this;

	var to = 'elad.benisrael@gmail.com';
	var from = 'sender@example.com';

	var contents = connection.transaction.data_lines.join('');

	outbound.send_email(from, to, contents, function (code, msg) {
		switch (code) {
			case DENY:
				plugin.logerror("Sending mail failed: " + msg);
				return next(DENY);
			case OK:
				plugin.loginfo("mail sent");
				return next(OK);
			default:
				plugin.logerror("Unrecognised return code from sending email: " + msg);
				return next();
		}
	});
};

