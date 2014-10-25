'use strict';

var path = require('path');
var fs   = require('fs');

/**
  Static middleware.
  @constructor
  @param {Object} options - middleware options:
  @param {String} [options.prefix=''] - URL path prefix
  @param {String} [options.root='.'] - root of the static files server
  @param {Object} [options.mimes] - mime-types map (*file extension: mime type*). By default mime-type sets to 'application/octet-stream' for any unknown
  extension.
  @return {Function}
 */
function Static(options) {
  var mw = function(req, res, next) {
    // Check and remove prefix
    var file = req.url;
    if(file.substr(0, prefix.length) !== prefix) return next();
    file = file.substr(prefix.length);
    // Required filename
    file = path.resolve(path.join(root, file));
    console.log('!!!', file);
    // Error if out of root
    if(file.substr(0, root.length) !== root) return req.unauthorized();
    // Continue if not found
    fs.exists(file, function(exists) {
      if(!exists) return next();
      // log.DBG('Static: "', file, '".');
      var mime = mimes[path.extname(file).slice(1)] || 'application/octet-stream';
      file = fs.createReadStream(file);
      // res.mime(mime).pipe(file);
      res.setHeader('Mime-Type', mime);
      file.pipe(res);
    });
  };
  var opts = options || {};
  var prefix = opts.prefix || '';
  var root = path.resolve(opts.root || '.');
  var mimes = opts.mimes || {};
  if(prefix[prefix.length-1] !== '/') prefix += '/';

  return mw;
}

module.exports = Static;
