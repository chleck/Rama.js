'use strict';

var Core = require('./core');

// RegExp for route arguments parser
var argRx = /(.*?)\{([a-zA-Z\d]*?)\/(.+?)\/\}|.+/g;
// RegExp for escaping special characters in RegExp string
var escapeRx = /([.*+?^${}()|\[\]\/\\])/g;

function Route(name, tpl, target) {
  var self = this;
  this.name = name;
  this.children = [];
  this.args = [];
  this.tpl = tpl;
  // Strict route
  if(tpl[0] === '!') {
    this.strict = true;
    this.tpl = this.tpl.slice(1);
  }
  this.target = target;
  // Get name of the parent route
  if(name) this.parent = name.indexOf('.') !== -1 ? name.substring(0, name.lastIndexOf('.')) : '';
  // Create arguments parser regexp
  this.rx = new RegExp(this.tpl.replace(argRx, function(match, prefix, name, rx) {
    if(name) self.args.push(name);
    if(rx) return prefix.replace(escapeRx, '\\$1') + '(' + rx + ')'; else return match.replace(escapeRx, '\\$1');
  }));
}

/**
  Request routing middleware.
  @constructor
  @returns {Function}
  @param {String} - router name
  @prop {String} name - router name
*/
function Router(name) {
  var mw = function(req, res, next) {
    _core(req, res, function() {
      res.mount = res.mount || '';
      res.href = href;
      // Exec before, route and after middleware
      execBefore(req, res, function() {
        execRoute(req, res, function() {
          execAfter(req, res, next);
        });
      });
    });
  };
  // PUBLIC
  mw.name = name;
  // mw.entry = entry;
  mw.before = before;
  mw.after = after;
  mw.on = on;
  // mw.listen = listen;
  // mw.run = run;
  mw.resolve = resolve;
  mw.href = href;
  // PRIVATE
  var _core = new Core();
  // Listen
  // var _listen = [];
  // Before middleware
  var _before = [];
  // After middleware
  var _after = [];
  // Active routes
  var routes = {};
  // Queued routes
  var queue = {};
  // Return middleware
  return mw;
  // PUBLIC METHODS
  /** Add *before* routing middleware.
    @method Router#before
    @param {Function} mw - middleware
  */
  function before(mw) {
    _before.push(mw);
    return this;
  }
  /** Add *after* routing middleware.
    @method Router#after
    @param {Function} mw - middleware
  */
  function after(mw) {
    _after.push(mw);
    return this;
  }
  /** Add route.
    @method Router#on
    @param {String} name - route name
    @param {String} tpl - URL template
    @param {Function|Function[]} target - target middleware(s)
  */
  function on(name, tpl, target) {
    // Validate args
    if(typeof name !== 'string') throw new Error('Route name must be a string');
    if(routes.hasOwnProperty(name)) throw new Error('Route already exists');
    if(!Array.isArray(target)) target = [ target ];
    target.forEach(function(t) {
      if(typeof t !== 'function') throw new Error('Target is not a function');
    });
    // Create a new route
    var route = new Route(name, tpl, target);
    // Define the route if this is top-level route or parent was already defined
    if(!name || routes[route.parent]) {
      routes[name] = route;
      if(name) routes[route.parent].children.push(name);
      enableChildren(name);
    // Queue route otherwise (if parent is not defined yet)
    } else {
      if(!Array.isArray(queue[route.parent])) queue[route.parent] = [];
      queue[route.parent].push(route);
    }
    // Enable queued children routes
    function enableChildren(name) {
      if(queue[name]) {
        var parent = routes[name];
        var route;
        while(true) {
          route = queue[name].shift();
          if(!route) break;
          routes[route.name] = route;
          parent.children.push(route.name);
          enableChildren(route.name);
        }
      }
    }
    // console.log('\nRoutes: ', routes);
    return this;
  }
  /**
    Provided by {@link Router}. Build href by route name and params object.
    @method Response#href
    @param {String} name - route name
    @param {Object} args - route params
    @returns {String}
  */
  function href(name, args) {
    // var route = routes[name];
    if(!routes[name]) return null;
    // Result
    var key;
    var tmp = {};
    // Copy args to tmp
    if(typeof args === 'object') {
      for(key in args) {
        if(args.hasOwnProperty(key)) tmp[key] = args[key];
      }
    }
    // Router mountpoint
    var res = this.req.mount;
    // Route path
    var path = [];
    var route = routes[name];
    function argValue(match, prefix, name) {
      var arg = tmp[name] || '';
      delete tmp[name];
      return (prefix || match) + arg; 
    }
    while(route) {
      path.push(route.tpl.replace(argRx, argValue));
      route = routes[route.parent];
    }
    res += path.reverse().join('');
    // Additional args sorted by name
    var query = [];
    for(key in tmp) {
      query.push(key);
    }
    query = query.sort().map(function(key) { return key + '=' + tmp[key]; }).join('&');
    if(query) res += '?' + query;

    return res;
  }
  // PRIVATE
  // Find matched route for the given path
  function resolve(req) {
    // console.log('???', path);
    if(typeof req.tail === 'undefined') req.tail = req.path;
    // var path = req.path;
    // Name of the found route
    var name = null;
    // Matched part of the given path
    var resolved = '';
    var tail = req.tail;
    // Values of parsed arguments
    var args = {};
    // Start search from the root of routes tree
    if(routes['']) find([ '' ]); else return null;
    function find(routesNames) {
      // console.log('+++', resolved, tail, routesNames);
      for(var i in routesNames) {
        var route = routes[routesNames[i]];
        var matches = tail.match(route.rx);
        // If route found
        if(matches) {
          // Remember route name
          name = route.name;
          // Move matched part from path to resolved
          resolved += matches.shift();
          tail = req.tail.slice(resolved.length);
          // Save parsed args
          var argsNames = route.args;
          for(var ii in argsNames) {
            if(argsNames[ii]) args[argsNames[ii]] = matches[ii];
          }
          // If tail is empty, route is found
          // Else try to find match at the next level
          if(tail) find(route.children);
          break;
        }
      }
    }
    // Check a full match for a strict mode
    if(routes[name].strict && tail) return null;

    req.routes = req.routes || [];
    req.routes.push(routes[name]);
    req.mount = req.resolved || '';
    req.resolved = (req.resolved ? req.resolved : '') + resolved;
    req.tail = tail;
    req.args = req.args || {};
    for(var argName in args) req.args[argName] = args[argName];
    return routes[name];
  }
  function execBefore(req, res, next) {
    var i = 0;
    exec();
    function exec() {
      if(_before[i]) _before[i++](req, res, exec); else next();
    }
  }
  function execRoute(req, res, next) {
    var i = 0;
    var route = resolve(req);
    if(!route) res.statusCode = 404;
    exec();
    function exec() {
      if(route && route.target[i]) route.target[i++](req, res, exec); else next();
    }
  }
  function execAfter(req, res, next) {
    var i = 0;
    exec();
    function exec() {
      if(_after[i]) _after[i++](req, res, exec); else next();
    }
  }
}

module.exports = Router;
