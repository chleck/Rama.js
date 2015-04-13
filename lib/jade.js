'use strict';

var jade = require('jade');

/**
  Jade template engine middleware.
  @constructor
  @returns {Function}
  @param {Object} options - middleware options:
  @param {Boolean|String} [options.pretty] - pretty formatted output
  @param {Boolean} [options.cache] - enable cache of compiled functions by filename
*/
function Jade(options) {
  var mw = function(req, res, next) {
    res.jade = function(filename, locals) {
      // console.log('Rendering ', filename);
      var fn = jade.compileFile(filename, options);
      if(typeof locals !== 'object') locals = {};
      locals.req = req;
      locals.res = res;
      res.write(fn(locals));
      return res;
    };
    next();
  };
  return mw;
}

module.exports = Jade;
