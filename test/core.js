var request = require('supertest');

var $$ = require('..');

function wrapper(mw, f) {
  return function(req, res) {
    mw(req, res, function() {
      f(req, res);
    });
  }
}

describe('Core', function() {
  it('should return a Core middleware', function() {
    var core = new $$.Core();
    core.should.be.a.Function;
  });
  it('should extend HTTP request and response', function() {
    var core = new $$.Core();
    var req = {
      headers: { host: 'example.com:8080' },
      url: '/api/v2?q=test&rnd=8374'
    };
    var res = {};
    core(req, res, function() {
      req.res.should.equal(res);
      req.host.should.be.a.String.and.equal('example.com:8080');
      req.hostname.should.be.a.String.and.equal('example.com');
      req.port.should.be.a.Number.and.equal(8080);
      req.path.should.be.a.String.and.equal('/api/v2');
      req.query.should.be.an.Object.and.eql({ q: 'test', rnd: '8374' });
      res.req.should.equal(req);
      res.send.should.be.a.Function;
      res.status.should.be.a.Function;
      res.die.should.be.a.Function;
      res.error.should.be.a.Function;
      res.forbidden.should.be.a.Function;
      res.header.should.be.a.Function;
      res.json.should.be.a.Function;
      res.mime.should.be.a.Function;
      res.moved.should.be.a.Function;
      res.notFound.should.be.a.Function;
      res.refresh.should.be.a.Function;
      res.unauthorized.should.be.a.Function;
    });
  });
  describe('res', function() {
    describe('.done()', function() {
      it('should close response', function(done) {
        var f = wrapper(new $$.Core(), function(req, res) {
          res.done().should.equal(res);
        });
        request(f)
          .get('/')
          .expect(200, '', done);
      });
    });
    describe('.done(data)', function() {
      it('should writes data and close response', function(done) {
        var f = wrapper(new $$.Core(), function(req, res) {
          res.done('test').should.equal(res);
        });
        request(f)
          .get('/')
          .expect(200, 'test', done);
      });
    });
    describe('.send()', function() {
      it('should send a string', function(done) {
        var f = wrapper(new $$.Core(), function(req, res) {
          res.send('aaa').should.equal(res);
          res.done();
        });
        request(f)
          .get('/')
          .expect(200, 'aaa', done);
      });
    });
    describe('.status(code)', function() {
      it('should send a status code', function(done) {
        var f = wrapper(new $$.Core(), function(req, res) {
          res.status(201).should.equal(res);
          res.done();
        });
        request(f)
          .get('/')
          .expect(201, done);
      });
    });
    describe('.status(code, msg)', function() {
      it('should send a status code with text message', function(done) {
        var f = wrapper(new $$.Core(), function(req, res) {
          res.status(201, 'Ok!').should.equal(res);
          res.done();
        });
        request(f)
          .get('/')
          .expect(201, 'Ok!', done);
      });
    });
    describe('.status()', function() {
      it('should return the current status code', function(done) {
        var f = wrapper(new $$.Core(), function(req, res) {
          res.status(201).done('Status is ' + res.status());
        });
        request(f)
          .get('/')
          .expect(201, 'Status is 201', done);
      });
    });
    describe('.header(name, value)', function() {
      it('should set a response header', function(done) {
        var f = wrapper(new $$.Core(), function(req, res) {
          res.header('Test-Header', 'TestHeaderValue').should.equal(res);
          res.done();
        });
        request(f)
          .get('/')
          .expect('Test-Header', 'TestHeaderValue', done);
      });
    });
    // TODO Array forks fine for 'Set-Cookie' header only. Why? Is it a bug of the supertest?
    describe('.header(name, array)', function() {
      it('should set multiple response headers', function(done) {
        var f = wrapper(new $$.Core(), function(req, res) {
          res.header('Set-Cookie', [ 'a', 'b', 'c' ]).should.equal(res);
          res.done();
        });
        request(f)
          .get('/')
          .expect(function(res) {
            res.headers['set-cookie'].should.eql([ 'a', 'b', 'c' ]);
          })
          .end(done);
      });
    });
    describe('.header(name, value, true)', function() {
      it('should append to the current values of the response header', function(done) {
        var f = wrapper(new $$.Core(), function(req, res) {
          res.header('Set-Cookie', 'a')
          res.header('Set-Cookie', 'b', true).should.equal(res);
          res.done();
        });
        request(f)
          .get('/')
          .expect(function(res) {
            res.headers['set-cookie'].should.eql([ 'a', 'b' ]);
          })
          .end(done);
      });
    });
    describe('.header(name)', function() {
      it('should return the value of the response header', function(done) {
        var f = wrapper(new $$.Core(), function(req, res) {
          res.header('Test-Header', 'TestHeaderValue');
          res.done('Test-Header is ' + res.header('Test-Header'));
        });
        request(f)
          .get('/')
          .expect(200, 'Test-Header is TestHeaderValue', done);
      });
    });
    describe('.header(name, null)', function() {
      it('should remove the header', function(done) {
        var f = wrapper(new $$.Core(), function(req, res) {
          res.header('Test-Header', 'TestHeaderValue');
          res.header('Test-Header', null).should.equal(res);
          res.done();
        });
        request(f)
          .get('/')
          .expect(function(res) {
            (typeof res.headers['test-header'] === 'undefined').should.be.true;
          })
          .end(done);
      });
    });
    describe('.moved(location, temporarily)', function() {
      it('should set "Location" header and status code 301 when temporarily is false', function(done) {
        var f = wrapper(new $$.Core(), function(req, res) {
          res.moved('/').should.equal(res);
          res.done();
        });
        request(f)
          .get('/')
          .expect(301, '')
          .expect('Location', '/', done);
      });
      it('should set "Location" header and status code 302 when temporarily is true', function(done) {
        var f = wrapper(new $$.Core(), function(req, res) {
          res.moved('/', true).should.equal(res);
          res.done();
        });
        request(f)
          .get('/')
          .expect(302, '')
          .expect('Location', '/', done);
      });
    });
    describe('.unauthorized(msg)', function() {
      it('should set status code 401 when msg is not defined', function(done) {
        var f = wrapper(new $$.Core(), function(req, res) {
          res.unauthorized('').should.equal(res);
          res.done();
        });
        request(f)
          .get('/')
          .expect(401, '', done);
      });
      it('should set status code 401 and write msg when msg is defined', function(done) {
        var f = wrapper(new $$.Core(), function(req, res) {
          res.unauthorized('test').should.equal(res);
          res.done();
        });
        request(f)
          .get('/')
          .expect(401, 'test', done);
      });
    });
    describe('.forbidden(msg)', function() {
      it('should set status code 403 when msg is not defined', function(done) {
        var f = wrapper(new $$.Core(), function(req, res) {
          res.forbidden('').should.equal(res);
          res.done();
        });
        request(f)
          .get('/')
          .expect(403, '', done);
      });
      it('should set status code 403 and write msg when msg is defined', function(done) {
        var f = wrapper(new $$.Core(), function(req, res) {
          res.forbidden('test').should.equal(res);
          res.done();
        });
        request(f)
          .get('/')
          .expect(403, 'test', done);
      });
    });
    describe('.notFound(msg)', function() {
      it('should set status code 404 when msg is not defined', function(done) {
        var f = wrapper(new $$.Core(), function(req, res) {
          res.notFound('').should.equal(res);
          res.done();
        });
        request(f)
          .get('/')
          .expect(404, '', done);
      });
      it('should set status code 404 and write msg when msg is defined', function(done) {
        var f = wrapper(new $$.Core(), function(req, res) {
          res.notFound('test').should.equal(res);
          res.done();
        });
        request(f)
          .get('/')
          .expect(404, 'test', done);
      });
    });
    describe('.error(msg)', function() {
      it('should set status code 500 when msg is not defined', function(done) {
        var f = wrapper(new $$.Core(), function(req, res) {
          res.error('').should.equal(res);
          res.done();
        });
        request(f)
          .get('/')
          .expect(500, '', done);
      });
      it('should set status code 500 and write msg when msg is defined', function(done) {
        var f = wrapper(new $$.Core(), function(req, res) {
          res.error('test').should.equal(res);
          res.done();
        });
        request(f)
          .get('/')
          .expect(500, 'test', done);
      });
    });
    describe('.mime(mime)', function() {
      it('should set "Content-Type" header', function(done) {
        var f = wrapper(new $$.Core(), function(req, res) {
          res.mime('text/plain').should.equal(res);
          res.done();
        });
        request(f)
          .get('/')
          .expect(200, '')
          .expect('Content-Type', 'text/plain', done);
      });
    });
    describe('.refresh(location, timeout)', function() {
      it('should set "Refresh" header with 0 timeout when timeout is not defined', function(done) {
        var f = wrapper(new $$.Core(), function(req, res) {
          res.refresh('/').should.equal(res);
          res.done();
        });
        request(f)
          .get('/')
          .expect(200, '')
          .expect('Refresh', '0; url=/', done);
      });
      it('should set "Refresh" header with given timeout when timeout is defined', function(done) {
        var f = wrapper(new $$.Core(), function(req, res) {
          res.refresh('/', 10).should.equal(res);
          res.done();
        });
        request(f)
          .get('/')
          .expect(200, '')
          .expect('Refresh', '10; url=/', done);
      });
    });
    describe('.die(e)', function() {
      it('should set status code 500 and write error message when error is String', function(done) {
        var f = wrapper(new $$.Core(), function(req, res) {
          res.die('Error!').should.equal(res);
          // res.done();
        });
        request(f)
          .get('/')
          .expect(500, 'Error!', done);
      });
      it('should set status code 500 and write error name, message and stack trace when error is Error', function(done) {
        var f = wrapper(new $$.Core(), function(req, res) {
          res.die(new Error('Exception!')).should.equal(res);
        });
        request(f)
          .get('/')
          .expect(function(res) {
            res.text.should.startWith('Error:\n').and.containEql('Exception!');
          })
          .end(done);
      });
    });
    describe('.json(data)', function() {
      it('should set "Content-Type" header to "application/json" and write data as JSON', function(done) {
        var f = wrapper(new $$.Core(), function(req, res) {
          res.json({ a: 1, b: true, c: 'test' }).should.equal(res);
          res.done();
        });
        request(f)
          .get('/')
          .expect('Content-Type', 'application/json')
          .expect(200)
          .expect(function(res) {
            res.body.should.have.property('a', 1);
            res.body.should.have.property('b', true);
            res.body.should.have.property('c', 'test');
          })
          .end(done);
      });
      it('should set "Content-Type" header to "application/json" and write data as pretty JSON', function(done) {
        var f = wrapper(new $$.Core(), function(req, res) {
          res.json({ a: 1, b: true, c: 'test' }, true).should.equal(res);
          res.done();
        });
        request(f)
          .get('/')
          .expect('Content-Type', 'application/json')
          .expect(200)
          .expect(function(res) {
            res.body.should.have.property('a', 1);
            res.body.should.have.property('b', true);
            res.body.should.have.property('c', 'test');
            res.text.should.equal('{\n  "a": 1,\n  "b": true,\n  "c": "test"\n}');
          })
          .end(done);
      });
    });
  });
});
