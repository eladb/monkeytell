var async = require('async');
var path = require('path');
var fs = require('fs');
var dynamostore = require('./dynamostore');
var notify = require('./monitor').notify;

module.exports = function(options) {
	options = options || {};
	var logger = options.logger || console;

	var api = {};
	var groupsFile = path.join(__dirname, '..', 'groups.json');
	var groups = JSON.parse(fs.readFileSync(groupsFile));
	console.log(groups);

	var store = dynamostore({ logger: logger });

	/**
	 * resolves an address and returns information about the group
	 * or an error if the group was not found
	 */
	api.resolve = function(address, callback) {
		// first, try to resolve via the store
		logger.log('store.get', address);
		store.get(address, function(err, group) {
			if (err) {
				logger.warn('store.get failed: ' + address + ' in store, trying in-memory cache');
				group = groups[address.toLowerCase()];
			}
			else {
				logger.log('store.get returned:', group);
				groups[address.toLowerCase()] = group; // store in cache
			}

			// if we couldn't find the group, still, return an error.
			if (!group) {
				logger.error('group not found');
				return callback(new Error('group ' + address + ' not found'));
			}

			// if the group is an alias, resolve again
			if (group.alias) {
				logger.log('group is an alias, resolve again');
				return api.resolve(group.alias, callback);
			}

			// return the group metadata
			return callback(null, group);
		});
	};

	/** 
	 * resolves multiple addresses and returns the distict set of members
	 * from all the addresses (does not return any other information about the group).
	 */
	api.resolveMany = function(addresses, callback) {
		var members = {};
		var groups = {};

		async.forEach(addresses, function(address, cb) {
			api.resolve(address, function(err, group) {
				if (err) return cb(); // address is not a group

				// store list of groups found
				groups[address.toLowerCase()] = true;

				// found group, append members
				group.members.forEach(function(member) {
					members[member.toLowerCase()] = true;
				});

				return cb();
			});
		}, function (err) {
			if (err) return callback(err);
			return callback(null, { 
				groups: Object.keys(groups), 
				members: Object.keys(members),
			});
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

			// store group
			return store.create(address, metadata, function(err) {
				if (err) return callback(err);

				// add group to in-memory cache
				groups[address] = metadata;

				// notify about group creation (fire & forget)
				notify('A new group was created: ' + address);

				// add the group
				return callback();
			});
		});	
	};

	/**
	 * deletes a group
	 */
	api.remove = function(address, callback) {
		return store.remove(address, function(err) {
			if (err) return callback(err);
			delete groups[address]; // delete from in-memory cache
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

		//
		// all okay, go on
		//
		
		return callback();
	}

	return api;
}