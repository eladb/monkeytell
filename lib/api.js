var restify = require('restify');
var Validator = require('validator').Validator;

var groups = require('./groups')();

var server = restify.createServer({
	name: 'api',
});

var groupRoute = /^\/groups\/([^\/]+)$/;

server.use(restify.acceptParser(server.acceptable));
//server.use(restify.queryParser());
server.use(restify.bodyParser({ mapParams:false }));

server.get(groupRoute, function(req, res, next) {
	var log = req.log;

	var groupName = req.params[0];

	log.info('Resolving', groupName);

	groups.resolve(groupName, function(err, group) {
		if (err) {
			res.send(new restify.ResourceNotFoundError('Group \'' + groupName + '\' not found'));
		}
		else {
			res.send(200, group);
		}

		return next();
	});
});

server.post(groupRoute, function(req, res, next) {
	var log = req.log;
	var groupName = req.params[0];

	if (!req.is('json')) {
		console.warn('Request is not json');
		return next(new restify.InvalidHeaderError('Expecting application/json'));
	}

	//
	// create the group
	//

	groups.create(groupName, req.body, function(err) {
		if (err) {
			switch (err.code) {
				case 'ECONFLICT': return next(new restify.ConflictError(err.message));
				case 'EADDRESS': return next(new restify.InvalidArgumentError(err.message));
				case 'EARG': return next(new restify.MissingParameterError(err.message));
				default: return next(new restify.ServerError(err.message));
			}
		}

		res.send(201);
		return next();
	});

});

module.exports = server;