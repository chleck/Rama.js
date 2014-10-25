// Dummy file for documentation system.

/**
  ### HTTP request.
  This is an instance of Node.js {@link http://nodejs.org/api/http.html#http_http_incomingmessage http.IncomingMessage} with augments provided by Core
  components.
  @constructor Request
  @prop {Response} res - HTTP response (provided by {@link Core}).
  @prop {String} host - target host (the value of the HOST header) (provided by {@link Core}).
  @prop {String} hostname - hostname part of Request.host (provided by {@link Core}).
  @prop {Number} port - port number part of Request.host (provided by {@link Core}).
  @prop {String} path - URL path (provided by {@link Core}).
  @prop {Object} query - URL query (provided by {@link Core}).
  @prop {String} mount - router mountpoint (provided by {@link Router}).
  @prop {String} resolved - resolved part of URL path (provided by {@link Router}).
  @prop {String} tail - unresolved part of URL path (provided by {@link Router}).
  @prop {String} args - parsed arguments (provided by {@link Router}).
  @prop {Object} body - POST request fields (provided by {@link Body}).
  @prop {Object} files - POST request files (provided by {@link Body}).
  @property {Object} cookies - request cookies (provided by {@link Cookies}).
  @property {Object} session - session data (provided by {@link Sessions}).
*/
