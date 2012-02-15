var async = require('async');

module.exports = function() {
	var api = {};

	var groups = {
		'gang@monkeytell.com': {
			desc: 'the monkeytell gang',
			members: [
				'elad.benisrael@gmail.com',
				'nirsanirsa@gmail.com',
				'syahalom@gmail.com',
				'daniel.grumer@gmail.com'
			]
		},

		'test+monkeys@monkeytell.com': {
			desc: 'the monkeytell gang',
			members: [
				'elad.benisrael@gmail.com',
				'nirsanirsa@gmail.com',
				'syahalom@gmail.com',
				'daniel.grumer@gmail.com'
			]
		},

		'test+onlyelad@monkeytell.com': {
			desc: 'only elad',
			members: [
				'elad.benisrael@gmail.com'
			]
		},

		'test+alsomonkeys@monkeytell.com': {
			alias: 'test+monkeys@monkeytell.com'			
		},

		'test+onlyelad2@monkeytell.com': {
			members: [
				'elad.benisrael.2@gmail.com'
			]
		}
	};

	// resolves an address and returns information about the group
	// or an error if the group was not found
	api.resolve = function(address, callback) {
		var group = groups[address.toLowerCase()];
		if (!group) return callback(new Error('group ' + address + ' not found'));

		// if the group is an alias, resolve again
		if (group.alias) return api.resolve(group.alias, callback);

		return callback(null, group);
	};

	// resolves multiple addresses and returns the distict set of members
	// from all the addresses (does not return any other information about the group).
	api.resolveMany = function(addresses, callback) {
		var members = {};

		async.forEach(addresses, function(address, cb) {
			api.resolve(address, function(err, group) {
				if (err) return cb(); // address is not a group

				// found group, append members
				group.members.forEach(function(member) {
					members[member.toLowerCase()] = true;
				});

				return cb();
			});
		}, function (err) {
			if (err) return callback(err);
			return callback(null, Object.keys(members));
		});
	}

	return api;
}