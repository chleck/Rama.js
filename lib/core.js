'use strict';

var url = require('url');

/**
  Adds basic properties and methods to {@link Request} and {@link Response}.
  @constructor
  @returns {Middleware}
*/
function Core() {
  var mw = function(req, res, next) {
    var tmp;
    // Return if Core middleware is already applied
    if(req.res) return next();
    // Request
    req.res = res;
    if(typeof req.headers !== 'object') req.headers = {};
    req.host = req.headers.host || '';
    tmp = req.host.split(':');
    req.hostname = tmp[0];
    req.port = +tmp[1] || 80;
    if(typeof req.url !== 'string') req.url = '';
    tmp = url.parse(req.url, true);
    req.path = tmp.pathname || '';
    if(req.path[req.path.length-1] === '/') req.path = req.path.slice(0, -1);
    req.query = tmp.query;
    // Response
    res.req = req;
    res.done = done;
    res.send = send;
    res.status = status;
    res.header = header;
    res.moved = moved;
    res.unauthorized = unauthorized;
    res.forbidden = forbidden;
    res.notFound = notFound;
    res.error = error;
    res.mime = mime;
    res.refresh = refresh;
    res.die = die;
    res.json = json;
    next();
  };
  return mw;
  /** 
    Provided by {@link Core}. Close HTTP response.
    If *data* is set, writes *data* before close.
    @method Response#done
    @param {String} [msg] Data
    @return {this}
  */
  function done(data) {
    this.end(data);
    // Chaining
    return this;
  }
  /**
    Provided by {@link Core}. Get current HTTP response status.
    @method Response#status
    @return {Integer}
  */
  /** 
    Provided by {@link Core}. Set HTTP response status.
    If *msg* is set, sets mime type to 'text/plain', writes *msg* and closes response immediately.
    @method Response#status
    @param {Integer} code Status code
    @param {String} [msg] Optional message
    @return {this}
  */
  function status(code, msg) {
    if(code === undefined) return this.statusCode;
    this.statusCode = code;
    if(msg) this.mime('text/plain').done(msg);
    // Chaining
    return this;
  }
  /**
    Provided by {@link Core}. Get HTTP response header.
    @method Response#header
    @param {String} name - header name
    @return {String|String[]}
  */
  /**
    Provided by {@link Core}. Set/append HTTP response header. Remove header if *value* === *null*.
    @method Response#header
    @param {String} name - Header name
    @param {String} value - Header value
    @param {Boolean} append - Append to current header values array if true, replace header value otherwise
    @return {this}
    @example
        req
          // Set 'Content-Type' header for the current response
          .header('Content-Type', 'text/plain')
          // Set two 'Link' headers
          .header('Link', [ '</search?page=1>; rel=prev', '</search?page=3>; rel=next' ])
          // Append the third 'Link' header
          .header('Link', '</search?page=10>; rel=last', true)
  */
  function header(name, value, append) {
    if(typeof value === 'undefined') return this.getHeader(name);
    if(value === null) {
      this.removeHeader(name);
    } else {
      var current = this.getHeader(name);
      if(append && current) {
        this.setHeader(name, [].concat(current, value));
      } else {
        this.setHeader(name, value);
      }
    }
    // Chaining
    return this;
  }
  /**
    Provided by {@link Core}. Send data to the HTTP response.
    @method Response#send
    @param {String|Buffer} data - data to write
    @param {String} [encoding] - text encoding if *data* is *Buffer*
    @return {this}
    @example
      req.send('Buffer: ').send(buffer, 'utf8');
  */
  function send(data, encoding) {
    this.write(data, encoding);
    // Chaining
    return this;
  }
  /**
    Provided by {@link Core}. Set response status to 301 (*Moved Permanently*) or 302 (*Moved Temporarily*).
    @method Response#moved
    @param {String} location - new resource URL
    @param {Boolean} temporarily - 302 if true 301 otherwise
    @return {this}
  */
  function moved(location, temporarily) {
    return this.status(temporarily ? 302 : 301).header('Location', location);
  }

  /**
    Provided by {@link Core}. Set response status to 401 (*Unauthorized*).
    @method Response#unauthorized
    @param {String} [msg] - text message
    @return {this}
  */
  function unauthorized(msg) {
    return this.status(401, msg);
  }
  /**
    Provided by {@link Core}. Set response status to 403 (*Forbidden*).
    @method Response#forbidden
    @param {String} [msg] - text message
    @return {this}
  */
  function forbidden(msg) {
    return this.status(403, msg);
  }
  /**
    Provided by {@link Core}. Set response status to 404 (*Not found*).
    @method Response#notFound
    @param {String} [msg] - text message
    @return {this}
  */
  function notFound(msg) {
    return this.status(404, msg);
  }
  /**
    Provided by {@link Core}. Set response status to 500 (*Internal server error*).
    @method Response#error
    @param {String} [msg] - text message
    @return {this}
  */
  function error(msg) {
    return this.status(500, msg);
  }
  /**
    Provided by {@link Core}. Set response mime type.
    @method Response#mime
    @param {String} type - mime type
    @return {this}
  */
  function mime(type) {
    return this.header('Content-Type', type);
  }
  /**
    Provided by {@link Core}. Refresh/redirect page.
    @method Response#refresh
    @param {String} location - target URL
    @param {Integer} [timeout=0] - delay in seconds
    @return {this}
  */
  function refresh(location, timeout) {
    timeout = timeout || 0;
    return this.header('Refresh', '' + timeout + '; url=' + location);
  }
  /**
    Provided by {@link Core}. Close response with error.
    @method Response#die
    @param {String|Error} e - text message or exception
    @return {this}
  */
  function die(e) {
    var msg = e instanceof Error ? [ 'Error:', e.name, e.message, e.stack ].join('\n') : e;
    // log.ERR(msg);
    return this.error().mime('text/plain').done(msg); // !!! FIXME: Need to reset headers before this!
  }
  /**
    Provided by {@link Core}. Write JSON data and close response.
    @method Response#json
    @param {Object} data - JSON data
    @param {Boolean} pretty - generate pretty formatted JSON if true
    @return {this}
  */
  function json(data, pretty) {
    return this.mime('application/json').done(JSON.stringify(data, null, pretty ? '  ' : undefined));
  }
}

module.exports = Core;
