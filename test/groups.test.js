var groups = require('../lib/groups')();

exports.multipleMembers = function(test) {
	groups.resolve('test+monkeys@monkeytell.com', function(err, group) {
		test.ok(!err, err);
		test.ok(group);
		test.deepEqual(group, {
			desc: 'the monkeytell gang',
			members: [
				'elad.benisrael@gmail.com',
				'nirsanirsa@gmail.com',
				'syahalom@gmail.com',
				'daniel.grumer@gmail.com'
			]
		});

		test.done();''
	});
};

exports.differentCase = function(test) {
	groups.resolve('test+MOnKEYs@monkeytell.com', function(err, group) {
		test.ok(!err, err);
		test.ok(group);
		test.deepEqual(group, {
			desc: 'the monkeytell gang',
			members: [
				'elad.benisrael@gmail.com',
				'nirsanirsa@gmail.com',
				'syahalom@gmail.com',
				'daniel.grumer@gmail.com'
			]
		});

		test.done();''
	});
};

exports.notExists = function(test) {
	groups.resolve('test+doesnotExist@monkeytell.com', function(err, group) {
		test.ok(err);
		test.done();''
	});
};


exports.singleMember = function(test) {
	groups.resolve('test+onlyelad@monkeytell.com', function(err, group) {
		test.ok(!err, err);
		test.ok(group);
		test.deepEqual(group, {
			desc: 'only elad',
			members: [
				'elad.benisrael@gmail.com'
			]
		});

		test.done();''
	});
};

exports.alias = function(test) {
	groups.resolve('test+alsomonkeys@monkeytell.com', function(err, group) {
		test.ok(!err, err);
		test.ok(group);
		test.deepEqual(group, {
			desc: 'the monkeytell gang',
			members: [
				'elad.benisrael@gmail.com',
				'nirsanirsa@gmail.com',
				'syahalom@gmail.com',
				'daniel.grumer@gmail.com'
			]
		});

		test.done();''
	});
};

exports.resolveMany = function(test) {
	var addresses = [
		'test+MOnKEYs@monkeytell.com', 
		'test+alsomonkeys@monkeytell.com', 
		'test+doesnotExist@monkeytell.com', 
		'test+onlyelad@monkeytell.com', 
		'test+onlyelad2@monkeytell.com'
	];

	groups.resolveMany(addresses, function(err, members) {
		test.ok(!err, err);
		test.ok(members);
		test.ok(Array.isArray(members));
		test.deepEqual(members, [ 
			'elad.benisrael@gmail.com',
  		'nirsanirsa@gmail.com',
  		'syahalom@gmail.com',
  		'daniel.grumer@gmail.com',
  		'elad.benisrael.2@gmail.com' ]);
		test.done();
	});
}
