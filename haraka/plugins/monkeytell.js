var fs = require('fs');
var outbound = require('./outbound');
var async = require('async');
var mime = require('../../lib/mime');
var groups = require('../../lib/groups')();
var Address = require('./address').Address;

exports.hook_queue = function(next, connection) {
	var self = this;

	var addresses = connection.transaction.rcpt_to.map(function(a) { return a.address(); });

	var options = {
		includeList: false,   // include list address in the 'TO' field
		expandList: true,     // expand addresses in the list(s) in the 'TO' field
		prefixSubject: false, // add '[groupaddress]'' prefix to subject
	};

	return groups.resolveMany(addresses, function(err, result) {
		if (err) {
			return next(DENY);
		}

		var members = result.members;

		self.logdebug('Resolved targets:', members);

		if (members.length === 0) {
			return next(DENY);
		}

		//
		// update 'rcpt_to' with the list of target addresses
		//

		connection.transaction.rcpt_to = [];
		members.forEach(function(m) {
			connection.transaction.rcpt_to.push(new Address(m));
		});

		//
		// update 'to' header with the list of target addresses and group addresses
		//

		var toheader = '';

		if (options.includeList) toheader += addresses.join(',');

		if (options.expandList) {
			members.forEach(function(m) {
				if (toheader) toheader += ',';
				toheader += new Address(m).address();
			});
		}

		connection.transaction.remove_header('To');
		connection.transaction.add_header('To', toheader);
		self.logdebug('New "TO" header:', toheader);

		//
		// update 'subject' header (prefix with [group address])
		//

		if (options.prefixSubject) {
			var subject = connection.transaction.header.get('Subject');
			if (subject.substring(0, 1) !== '[') {
				subject = '[' + result.groups.join(', ') + '] ' + subject;
			}

			connection.transaction.remove_header('Subject');
			connection.transaction.add_header('Subject', subject);
			self.logdebug('New "SUBJECT" header: ', subject);
		}

		return outbound.send_email(connection.transaction, next);
	});

	return; //----

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