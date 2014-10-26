'use strict';

var request = require('supertest');

var Rama = require('..');

describe('Router', function() {
  it('should return a Router middleware', function() {
    var router = new Rama.Router();
    router.should.be.a.Function;
    router.before.should.be.a.Function;
    router.on.should.be.a.Function;
    router.after.should.be.a.Function;
    router.should.have.property('name', '');
  });
  describe('.on()', function() {
    it('should add route', function(done) {
      var router = new Rama.Router();
      router
      .on('', '', function(req, res, next) {
        res.write('Test on!');
        next();
      });
      request(router)
      .get('/')
      .expect(200, 'Test on!', done);
    });
    it('should add route with multiple targets', function(done) {
      var router = new Rama.Router();
      router
      .on('', '', [
        function(req, res, next) {
          res.write('One!');
          next();
        },
        function(req, res, next) {
          res.write('Two!');
          next();
        }
      ]);
      request(router)
      .get('/')
      .expect(200, 'One!Two!', done);
    });
    it('should add multiple routes', function(done) {
      var router = new Rama.Router();
      router
      .on('blog', '/blog', function(req, res, next) {
        res.write('Blog!');
        next();
      })
      .on('', '', function(req, res, next) {
        res.write('Index!');
        next();
      });
      var agent = request.agent(router);
      agent
      .get('/')
      .end(function(err, res) {
        res.statusCode.should.be.eql(200);
        res.text.should.be.eql('Index!');
        agent
        .get('/blog')
        .end(function(err, res) {
          res.statusCode.should.be.eql(200);
          res.text.should.be.eql('Blog!');
          done();
        });
      });
    });
    it('should add route with args', function(done) {
      var router = new Rama.Router();
      router
      .on('', '', function(req, res, next) {
        next();
      })
      .on('blog', '!/blog/{year/\\d{4}/}/json', function(req, res, next) {
        req.should.have.property('args');
        req.args.should.be.an.Object;
        req.args.should.have.property('year', '1984');
        res.write(req.args.year)
        next();
      });
      request(router)
      .get('/blog/1984/json')
      .expect(200, '1984', done);
    });
  });
  describe('.before()', function() {
    it('should add middleware before routing', function(done) {
      var router = new Rama.Router();
      router
      .before(function(req, res, next) {
        res.write('Test before!');
        next();
      })
      .on('', '', function(req, res, next) {
        res.write('Test on!');
        next();
      });
      request(router)
      .get('/')
      .expect(200, 'Test before!Test on!', done);
    });
  });
  describe('.after()', function() {
    it('should add middleware after routing', function(done) {
      var router = new Rama.Router();
      router
      .on('', '', function(req, res, next) {
        res.write('Test on!');
        next();
      })
      .after(function(req, res, next) {
        res.write('Test after!');
        next();
      });
      request(router)
      .get('/')
      .expect(200, 'Test on!Test after!', done);
    });
  });
  describe('.href()', function() {
    it('should return href for given route name and args', function(done) {
      var router = new Rama.Router();
      router
      .on('', '', function(req, res, next) {
        next();
      })
      .on('blog', '!/blog/{year/\\d{4}/}/json', function(req, res, next) {
        res.write(res.href('blog', { year: 4891, q: 'test' }));
        next();
      });
      request(router)
      .get('/blog/1984/json')
      .expect(200, '/blog/4891/json?q=test', done);
    });
  });
  it('should return 404 for bad URL', function(done) {
    var router = new Rama.Router();
    router
    .on('', '!', function(req, res, next) {
      res.write('Test on!');
      next();
    });
    request(router)
    .get('/nonexistent')
    .expect(404, done);
  });
});
