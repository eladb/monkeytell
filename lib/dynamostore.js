var fs = require('fs');
var dynamo = require('dynamo');
var async = require('async');

/**
 * creates a dynamo group store
 */
module.exports = function(options) {
  options                 = options                 || {};
  options.accessKeyId     = options.accessKeyId     || process.env.AWS_ACCESS_KEY_ID;
  options.secretAccessKey = options.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY;

  if (!options.accessKeyId || !options.secretAccessKey) {
    throw new Error('AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables are required');
  }

  var logger = options.logger || console;

  var db = dynamo.createClient({
      accessKeyId: options.accessKeyId,
      secretAccessKey: options.secretAccessKey,
  });

  var groupsTable = db.get('groups');

  var api = {};

  /**
   * retrieve a group by address
   */
  api.get = function(address, callback) {
    if (!address) throw new Error('address is required');
    if (!callback) callback = function() { };

    return groupsTable
      .get({ address: address })
      .fetch(function(err, item) {
        if (!err && !item) err = new Error('not found');
        return logcb('get ' + address, callback)(err, item);
      });
  }

  /**
   * creates a group
   */
  api.create = function(address, metadata, callback) {
    if (!address) throw new Error('address is required');
    if (!metadata) throw new Error('metadata is required');

    // create an entity by merging `metadata` and `address`.
    var g = { address: address };
    for (var k in metadata) g[k] = metadata[k];

    return groupsTable.put(g)
      .when('address', '==', null)
      .save(function(err) {
        if (err && /ConditionalCheckFailedException/.test(err.name)) err = new Error('already exists');
        return logcb('create ' + address, callback)(err);
      });
  };

  /**
   * deletes a group by address
   */
  api.remove = function(address, callback) {
    return groupsTable
      .get({ address: address })
      .remove(logcb('remove ' + address, callback));
  };

  /**
   * returns all the groups
   */
  api.all = function(callback) {
    return groupsTable
      .scan()
      .fetch(logcb('all', callback));
  };

  /**
   * removes all groups (dir balak!)
   */
  api.clear = function(callback) {
    return api.all(function(err, groups) {

      if (err) {
        logger.error('clear: ' + err.toString());
        return callback(err);
      }

      return async.forEach(groups, function(group, cb) {
        return api.remove(group.address, function(err) {
          return cb(); // ignore errors
        });
      }, logcb('clear', callback));

    });
  };

  function logcb(op, callback) {
    if (!callback) callback = function() { };
    return function(err) {
      if (err) {
        logger.error(op + ': ' + err.toString());
      }

      return callback.apply(api, arguments);
    };
  }

  return api;
};