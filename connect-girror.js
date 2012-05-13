var girror = require('girror');
var express = require('express');
var http_proxy = require('http-proxy');
var spawn = require('child_process').spawn;
var path = require('path');
var fs = require('fs');

module.exports = function(url) {
  var app = express.createServer();

  var salt = Math.round(Math.random() * 1000000);
  var workdir = path.join('/tmp', 'connect-girror', salt.toString(), url.replace(/[\/\/\:\?\&]/g, '_'));
  console.log('workdir:', workdir);
  function mk_error_http_handler(status, message) {
    return function(req, res, next) {
      res.writeHead(status);
      return res.end(message);
    };
  }
  
  var last_deploy = 0;
  var deploy_ttl = 10000;
  var in_progress = false;
  var droid = null;
  
  var handler = mk_error_http_handler(503);
  function change_handler(new_handler) {
    handler = new_handler;
    return new_handler;
  }

  function deploy() {

    //
    // do nothing if deployment is in progress
    // or if deployment age is smaller than `deploy_ttl`
    //

    if (in_progress) return;
    var age = Date.now() - last_deploy;
    if (age < deploy_ttl) return;


    //
    // pull new code
    //

    in_progress = true;
    last_deploy = Date.now();
    girror(url, workdir, function(err) {
      if (err) {
        in_progress = false;
        change_handler(mk_error_http_handler(500, err.toString()));
        return;
      }
      else {
        var main_module = path.join(workdir, 'app.js');
        return path.exists(main_module, function(exists) {
          in_progress = false;
          if (!exists) {
            return change_handler(mk_error_http_handler(500, 'app.js not found under:' + main_module));
          }
          else {
            if (!droid) {
              droid = mkdroid(main_module);
            }

            change_handler(droid);
            return;
          }
        });
      }
    });

    return;
  }

  deploy()

  app.use(function(req, res, next) {
    deploy();
    return handler(req, res, next);
  });

  return app;
};

function mkdroid(module) {
  var appdir = path.dirname(module);
  var port = 5400;

  var error_msg = null;
  var restart_timeout = null;

  function start() {
    var env = { port: port };
    var child = spawn(process.execPath, [ module ], { cwd: appdir, env: env });
    
    child.on('error', function(err) {
      error_msg = err.toString();
      clearTimeout(restart_timeout);
      restart_timeout = null;
    });

    child.on('exit', function(code) {
      error_msg = 'app exited with code: ' + code;
      clearTimeout(restart_timeout);
      restart_timeout = null;
    });

    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);

    child.stop = function() {
      child.removeAllListeners('exit');
      child.removeAllListeners('error');
      child.kill();
    };

    return child;
  }

  var child = start();

  var proxy = http_proxy.createServer(port, 'localhost');
  fs.watch(module, { persistent: false }, function() {

    if (restart_timeout) {
      console.log('already restarting');
      return;
    }

    console.log('app changed, restarting in 5 seconds');

    restart_timeout = setTimeout(function() {
      console.log('restarting app');
      restart_timeout = null;
      error_msg = null;
      child.stop();
      child = start();
    }, 5000);
  });

  return function(req, res, next) {
    if (error_msg) {
      res.writeHead(500);
      return res.end(error_msg);
    }

    return proxy.emit('request', req, res);
  };

  return d;
}