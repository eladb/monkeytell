var mailer = require('mailer');

function notify(message, callback) {
  callback = callback || function(err) {
    if (err) console.error('Unable to send ping:', err);
    else console.info('OK');
  };

  console.info('Pinging monkeytell with message:', message);
  return mailer.send({
    host: "smtp.gmail.com",
    port: "465",
    ssl: true,
    domain: "gmail.com",
    to: "gang.monitor@monkeytell.com",
    from: "monkeytell.monitor@gmail.com",
    subject: message,
    body: message,
    authentication: "login",
    username: "monkeytell.monitor",
    password: "2012Monkeytell"
  }, callback);
}

function ping() {
  notify("I'm alive, baby!");
}

exports.notify = notify;

exports.start = function() {
  // ping every 30 minutes
  setInterval(ping, 30*60*1000);
  ping();  
};