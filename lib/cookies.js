'use strict';

/**
  Cookie support middleware.
  @constructor
  @returns {Function}
 */
function Cookies() {
  var mw = function(req, res, next) {
    req.cookies = {};
    // Split cookie header to key=value pairs
    var pairs = (req.headers.cookie || '').split(/[;,] */);
    // Parse each pair
    for(var i in pairs) {
      var pair = pairs[i];
      var key = pair.substr(0, pair.indexOf('='));
      var value = pair.substr(key.length + 1).trim();
      key = key.trim();
      // No '=' in string or string starts with '='
      if(!key) continue;
      // Trim '"' if presents
      if(value[0] == '"') value = value.slice(1, -1);
      // Add each value only one time
      req.cookies[key] = decodeURIComponent(value);
    }
    // Set cookie
    res.cookie = cookie;
    next();
  };
  return mw;
  /**
    Provided by {@link Cookies}. Set or remove cookie.
    @method Response#cookie
    @param {String} name - cookie name
    @param {String} value - cookie value. Remove cookie if *value* is *null*.
    @param {Object} opts - cookie options:
    @param {Date|Number} [opts.expires] - expiration date/time or timeout in seconds
    @param {String} [opts.path='/'] - cookie path
    @param {String} [opts.domain] - cookie domain
    @param {Boolean} [opts.http=false] - HttpOnly flag
    @param {Boolean} [opts.secure=false] - Secure flag
    @returns {this}
  */
  function cookie(name, value, opts) {
    var opts = opts || {};
    // Value
    var cookie = [ name + '=' + (value === null ? '' : encodeURIComponent(value)) ];
    // Expires
    if(value === null) {
      // Remove cookie
      cookie.push('Expires=' + (new Date(1)).toUTCString());
    } else if(opts.expires) {
      if(opts.expires instanceof Date) {
        cookie.push('Expires=' + opts.expires.toUTCString());
      } else {
        cookie.push('Expires=' + (new Date(Date.now() + opts.expires*1000)).toUTCString());
      }
    }
    // Path
    cookie.push('Path=' + (opts.path || '/'));
    // Domain
    if(opts.domain !== undefined) cookie.push('Domain=' + opts.domain);
    // HTTP only
    if(opts.http) cookie.push('HttpOnly');
    // Secure
    if(opts.secure) cookie.push('Secure');
    // cookies.push(cookie.join('; '));
    this.setHeader('Set-Cookie', cookie.join('; '), true);
    return this;
  }
}

module.exports = Cookies;
