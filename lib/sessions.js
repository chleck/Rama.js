'use strict';

var crypto = require('crypto');

/**
  Sessions middleware.

  Store sessions in memory by default. You can change this behaviour with custom *options.get* and *options.set*.

  Also you can use your own session IDs with custom *options.id*.
  @constructor
  @return {Function}
  @param {Object} options - middleware options:
  @param {Function} [options.get] - callback for loading session data
  @param {Function} [options.set] - callback for saving session data
  @param {Function} [options.id] - callback for generating session id
 */

function Sessions(options) {
  var mw = function(req, res, next) {
    var sid = req.cookies.session;
    if(!sid || !session[sid])
    {
      // Create new session id
      sid = id();
      // Create new session object
      sessions[sid] = {};
      // Set session cookie
      req.cookie('session', sid, 0, '/', '', true);
    }
    // Load session data
    req.session = get(sid);
    // Save session data on request done event
    req.on('done', function() {
      set(sid);
    })
    next();
  };
  options = options || {};
  // Session cache for middleware instance
  var sessions = {};
  var get = options.get || function(id) { return cache[id]; };
  var set = options.set || function() {};
  var id = options.id || _id;

  return mw;
}

function _id() {
  return crypto.randomBytes(32).toString('base64').slice(0, 32);
}

module.exports = Sessions;
