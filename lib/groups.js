var async = require('async');
var path = require('path');
var fs = require('fs');

module.exports = function() {
	var api = {};

	var groupsFile = path.join(__dirname, '..', 'groups.json');
	var groups = JSON.parse(fs.readFileSync(groupsFile));

	console.log(groups);

	/**
	 * resolves an address and returns information about the group
	 * or an error if the group was not found
	 */
	api.resolve = function(address, callback) {
		var group = groups[address.toLowerCase()];
		if (!group) return callback(new Error('group ' + address + ' not found'));

		// if the group is an alias, resolve again
		if (group.alias) return api.resolve(group.alias, callback);

		return callback(null, group);
	};

	/** 
	 * resolves multiple addresses and returns the distict set of members
	 * from all the addresses (does not return any other information about the group).
	 */
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
	};

	/**
	 * creates a group with address `address`. 
	 *
	 * `metadata` can be one of:
	 *
	 *   group descriptor:
	 * 	 	 `name` - display name of the group (optional)
	 *  	 `desc` - description of the group (optional)
	 * 		 `members` - array of targets (required)
	 * 		 `owner` - email address of the owner (required)
	 *
	 *   alias to a group:
	 * 		 `alias` - a an address of another group (all metadata is inherited)
	 *
	 * `callback` is `function(err)` with the following `err.code`:
	 * 
	 *  'EADDRESS': address error
	 *  'ECONFLICT': group already exists
	 *  'EALIAS': alias target does not exist
	 *  'EARG': missing/invalid argument
	 *
	 */
	api.create = function(address, metadata, callback) {
		// check if the group already exists
		if (groups[address]) {
			var e = new Error('Group \'' + address + '\' already exists');
			e.code = 'ECONFLICT';
			return callback(e);
		}

		return validateMetadata(metadata, function(err) {
			if (err) return callback(err);

			// add the group
			groups[address] = metadata;
			return callback();
		});	
	};

	// -- private
	
	function validateMetadata(metadata, callback) {

		// if alias is defined, verify that the target exists
		if (metadata.alias) {
			if (!(metadata.alias in groups)) {
				var e = new Error('Alias target \'' + metadata.alias + '\' does not exist');
				e.code = 'EALIAS';
				return callback(e);
			}

			// alias exists, okay
			return callback();
		}

		//
		// otherwise, verify we have an owner and at least one member
		//

		if (!metadata.owner) {
			var e = new Error('Field \'owner\' is missing');
			e.code = 'EARG';
			return callback(e);
		}

		if (!metadata.members) {
			var e = new Error('Field \'members\' is missing');
			e.code = 'EARG';
			return callback(e);
		}

	}

	return api;
}