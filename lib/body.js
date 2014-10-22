'use strict';

var formidable  = require('formidable');

/**
  Body parser middleware.
  @constructor
  @returns {Function}
  @param {Object} options - middleware options:
  @param {String} [options.encoding='utf-8'] - encoding
  @param {Number} [options.maxSize=2*1024*1024] - max field size
  @param {Number} [options.maxFields=1000] - max number of fileds
  @param {String} [options.uploads=os.tmpDir()] - uploads directory
  @param {Boolean} [options.ext=false] - keep file extensions for uploaded files
  @param {String} [options.hash='sha1'] - calculate files checksums (*'sha1'*, *'md5'* or *false*)
  @param {Boolean} [options.multiples=false] - allow multiple files upload with HTML5 *multiple* attribute
*/
function Body(options) {
  var mw = function(req, res, next) {
    var form = new formidable.IncomingForm();
    // Apply given options
    for(var name in opts) {
      if(typeof opts[name] !== 'undefined') {
        form[name] = opts[name];
      }
    }
    // Parse form fields and files and add result to the request object
    form.parse(req, function(err, body, files) {
      req.body  = body  || {};
      req.files = files || {};
      next();
    });
  };
  options = options || {};
  var opts = {
    encoding: options.encoding || 'utf-8',
    maxFieldSize: options.maxSize || 2*1024*1024,
    maxFields: options.maxFields || 1000,
    uploadDir: options.uploads,
    keepExtensions: options.ext,
    hash: options.hash,
    multiples: options.multiples
  };
  return mw;
}

module.exports = Body;
