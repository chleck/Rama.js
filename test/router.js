'use strict';

var core = require('..');

describe('Router', function() {
  it('should return a Router middleware', function() {
    var router = new core.Router();
    router.should.be.a.Function;
    router.before.should.be.a.Function;
    router.on.should.be.a.Function;
    router.after.should.be.a.Function;
    // router.listen.should.be.a.Function;
    // router.run.should.be.a.Function;
    router.should.have.property('name', '');
  });
  it('should support "before routing" middleware', function(done) {
    var router = new core.Router();
    router.before(function(req, res) {
      res.end();
    });
    router({}, { end: done });
  });
  it('should support "after routing" middleware', function(done) {
    var router = new core.Router();
    router.after(function(req, res) {
      res.end();
    });
    router({}, { end: done });
  });
  it('should support routing', function(done) {
    var router = new core.Router();
    router.on('', '', function(req, res) {
      res.end();
    });
    router({ url: '' }, { end: done });
  });
  it('should support multiple route targets', function(done) {
    var router = new core.Router();
    router.on('', '', [
      function(req, res, next) {
        res.cnt++;
        next();
      },
      function(req, res) {
        res.cnt.should.equal(1);
        res.end();
      }
    ]);
    router({ url: '' }, { cnt: 0, end: done });
  });
  it('should support route args', function(done) {
    var router = new core.Router();
    router
      .on('', '', function(){})
      .on('blog', '!/blog/{year/\\d{4}/}/json', function(req, res) {
        req.args.year.should.equal('1984');
        res.end();
      });
    router({ url: '/blog/1984/json' }, { end: done });
  });
});
