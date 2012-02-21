var fs = require('fs');
var outbound = require('./outbound');
var async = require('async');
var mime = require('../../lib/mime');
var groups = require('../../lib/groups')();

exports.hook_queue = function(next, connection) {
	var plugin = this;
	var lines = connection.transaction.data_lines;
	if (lines.length === 0) {
		return next(DENY);
	}
	
	var from = 'test@monkeytell.com';

	var contents = '';
	var metadata = {};

	var fields = ['to','from'];
	
	connection.transaction.data_lines.forEach(function(line) {
		plugin.logdebug('line:', line);

		fields.forEach(function(field) {
			if (field in metadata) return; // already found

			if (line.toLowerCase().indexOf(field + ':') === 0) {
				metadata[field] = mime.parseAddresses(line.substring(3));
			}
		});

		contents += line;
	});

	plugin.logdebug('extracted metadata from mail:', metadata);
	var addresses = metadata.to.map(function(x) { return x.address; });

	plugin.logdebug('resolving groups for addresses:', addresses);
	groups.resolveMany(addresses, function(err, members) {
		plugin.logdebug('resolved members:', members);

		return async.forEach(members, function(to, cb) {

			plugin.loginfo('sending mail to: ' + to);
			outbound.send_email(from, to, contents, function(code, msg) {
				switch (code) {
					case DENY:
						plugin.logerror("sending mail failed: " + msg);
						break;

					case OK:
						plugin.logdebug("mail sent");
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
	});
};