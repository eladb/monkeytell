var request = require('request');
var async = require('async');

var root = process.env.TESTED_URL || 'http://localhost:3000';

console.info('Running tests against:', root);

function get(path, callback) {
  return request({ method: 'get', url: root + path, json: true }, callback);
}

function post(path, json, callback) {
  return request({ method: 'post', url: root + path, json: json }, callback);
}

function del(path, callback) {
  return request({ method: 'delete', url: root + path, json: true }, callback);
}

exports.get_existing = function(test) {
  return get('/groups/gang@listzz.com', function(err, res, body) {
    test.ok(!err, body);
    test.ok(body);
    //body = JSON.parse(body);
    test.ok(body.members);
    test.ok(body.members.contains('elad.benisrael@gmail.com'));
    test.ok(body.members.contains('nirsanirsa@gmail.com'));
    return test.done();
  });
};

exports.create_existing = function(test) {
  return post('/groups/test+onlyelad@listzz.com', { members: ['1@gmail.com'] }, function(err, res, body) {
    test.ok(!err, err);
    test.equals(res.statusCode, 409);
    return test.done();
  });
};

exports.create_new = function(test) {
  var address = genaddress() + '@listzz.com';
  console.log('new group address: %s', address);

  var magicMember = genaddress() + '@blabla.com';

  var metadata = { 
    owner: 'elad.benisrael@gmail.com', 
    members: [ 'elad.benisrael.2@gmail.com', magicMember ], 
    _autogen: 'true' 
  };

  return async.series([

    // create a new list with a random name
    function(cb) {
      return post('/groups/' + address, metadata, function(err, res, body) {
        test.ok(!err, body);
        test.equals(res.statusCode, 201);
        return cb();
      });
    },

    // try to create the same one again (should fail on duplicate)
    function(cb) {
      return post('/groups/' + address, metadata, function(err, res, body) {
        test.ok(!err, body);
        test.equals(res.statusCode, 409);
        return cb();
      });
    },

    // now try to retrieve it
    function(cb) {
      return get('/groups/' + address, function(err, res, body) {
        test.ok(!err, body);
        test.ok(body.members.contains('elad.benisrael.2@gmail.com'));
        test.ok(body.members.contains(magicMember));
        return cb();
      });
    },

    // now delete it
    function(cb) {
      return del('/groups/' + address, function(err, res, body) {
        test.ok(!err, body);
        test.equals(res.statusCode, 200, JSON.stringify(body));
        return cb();
      });
    },

    // verify that it does not exist
    function(cb) {
      return get('/groups/' + address, function(err, res, body) {
        test.ok(!err, body);
        test.equals(res.statusCode, 404, JSON.stringify(body));
        return cb();
      });
    }

  ], function(err) {
    test.ok(!err, err);
    return test.done();
  })

};

// -- private

// http://stackoverflow.com/questions/237104/array-containsobj-in-javascript
Array.prototype.contains = function(obj) {
  var i = this.length;
  while (i--) {
    if (this[i] === obj) {
      return true;
    }
  }
  
  return false;
}

function genaddress() {
  return 'test+autogen+' + Math.round(Math.random() * 10000000);
}
