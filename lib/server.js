'use strict';

var fs = require('fs');
var http = require('http');
var https = require('https');

/**
  Run middleware as HTTP or HTTPS servers.
  @constructor
  @param {Function} - middleware function
*/
function Server(mw) {
  this.listen = listen;
  this.run = run;
  var _listen = [];
  /** Configure HTTP server.
    @method Server#listen
    @param {String} [host=0.0.0.0] - hostname or IP address
    @param {Number} [port=8000] - port number
  */
  /** Configure HTTPS server.
    @method Server#listen
    @param {String} host - hostname or IP address
    @param {Number} port - port number
    @param {String} cert - filename of certificate in PEM format
    @param {String} key - filename of private key in PEM format
  */
  function listen() {
    var args = Array.prototype.slice.call(arguments);
    var o = {};
    // Callback
    o.callback = args.pop();
    if(typeof o.callback !== 'function') {
      args.push(o.callback);
      delete o.callback;
    }
    // HTTPS cert and key
    if(args.length > 2) {
      o.key = args.pop();
      o.cert = args.pop();
    }
    // Host and port
    o.port = args.pop() || 8000;
    o.host = args.pop() || '0.0.0.0';
    _listen.push(o);
    return this;
  }
  /** Run all configured servers.
    @method Server#run
    @param {Function} callback
    @see Server#listen
  */
  function run(callback) {
    var i = _listen.length;
    _listen.forEach(function(o) {
      var server;
      if(!o.cert) {
        server = http.createServer(entry);
        server.listen(o.port, o.host, done);
      } else {
        fs.readFile(o.cert, function(err, data) {
          o.cert = data;
          fs.readFile(o.key, function(err, data) {
            o.key = data;
            server = https.createServer({ key: o.key, cert: o.cert }, entry);
            server.listen(o.port, o.host, done);
          });
        });
      }
    });
    return this;
    function done() { if(!--i && typeof callback === 'function') callback(); }
  }
  /**
    Entry point of the request processing.
    @method Server#entry
    @param {Object} request - HTTP request
    @param {Object} response - HTTP response
  */
  function entry(req, res) {
    // Exec middleware chains
    try {
      mw(req, res, function() {
        exit(req, res);
      });
    } catch(e) {
      console.log(e + (e.stack ? '\n' + e.stack : ''));
    }
  }
  // End of request processing
  function exit(req, res) {
    res.end();
    console.log(req.routes.map(function(r) { return r.name; }) + '\nEOR');
  }
}

/**
  Return a function which exec middleware and then exec callback.
  @method Server.exec
  @param {Function} mw - middleware
  @param {Function} callback - callback
*/
// Server.exec = function exec(mw, callback) {
//   return function(req, res) {
//     mw(req, res, function() {
//       callback(req, res);
//     });
//   };
// };

Server.exec = function exec() {
  var args = Array.prototype.slice.call(arguments);
  return function execNext(req, res, i) {
    i = i || 0;
    var mw = args[i++];
    if(mw) mw(req, res, function() {
      execNext(req, res, i);
    });
  };
};

module.exports = Server;
