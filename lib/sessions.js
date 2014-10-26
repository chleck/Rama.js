'use strict';

var crypto = require('crypto');

// Session storage
// var cache = {};

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
    // Check cookies middleware is enabled
    if(!req.cookies) throw new Error('Cookies is required by Session. Please apply Cookies middleware before Session.');
    // if(!req.cookies) {
    //   console.log('Cookies middleware should be enable before Session.');
    //   return next();
    // }
    var sid = req.cookies.session;
    if(!sid || !sessions[sid])
    {
      // Create new session id
      sid = id();
      // Create new session object
      sessions[sid] = {};
      // Set session cookie
      res.cookie('session', sid, 0, '/', '', true);
    }
    // Load session data
    req.session = get(sid);
    // Save session data on request done event
    res.on('finish', function() {
      set(sid);
    });
    next();
  };
  options = options || {};
  // Session cache for middleware instance
  var sessions = {};
  var get = options.get || function(id) { return sessions[id]; };
  var set = options.set || function() {};
  var id = options.id || _id;

  return mw;
}

function _id() {
  return crypto.randomBytes(32).toString('base64').slice(0, 32);
}

// Init crypto (first call is slow)
_id();

module.exports = Sessions;
