'use strict';

var fs = require('fs');
var stylus = require('stylus');

/**
  Stylus CSS preprocessor middleware.
  @constructor
  @returns {Function}
  @param {Object} options - middleware options:
  @param {Boolean|String} [options.pretty] - pretty formatted output
  @param {Boolean} [options.cache] - enable cache of compiled functions by filename
*/
function Stylus(options) {
  if(options.base.slice(-1) !== '/') options.base += '/';
  var mw = function(req, res, next) {
    if(req.path.slice(-5) !== '.styl') return next();
    var filename = (options.base || './') + req.path;
    fs.readFile(filename, { encoding: 'utf8' }, function(err, styl) {
      stylus(styl)
      .set('filename', filename)
      .render(function(err, css) {
        res
        .header('Content-Type', 'text/css')
        .done(css);
      });
    });
  };
  return mw;
}

module.exports = Stylus;
