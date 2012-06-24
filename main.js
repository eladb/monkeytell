var path = require('path');

//
// start http server
//

var server = require('./lib/api');
server.listen(process.env.port || 5000);
console.log('Listzz started on port', process.env.port || 5000);

//
// start smtp server
//

var haraka = require('./lib/haraka');
var smtp = haraka(path.join(__dirname, 'haraka'));
smtp.start();

//
// start monitor
//

var monitor = require('./lib/monitor');
monitor.start();
