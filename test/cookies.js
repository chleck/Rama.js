'use strict';

var request = require('supertest');

var Rama = require('..');

describe('Cookies', function() {
  it('should return a Cookies middleware', function() {
    var cookies = new Rama.Cookies();
    cookies.should.be.a.Function;
  });
  it('should extend HTTP request and response', function(done) {
    var f = Rama.exec(new Rama.Cookies(), function(req, res) {
      req.should.have.property('cookies');
      req.cookies.should.be.an.Object;
      res.should.have.property('cookie');
      res.cookie.should.be.a.Function;
      res.end();
    });
    request(f)
      .get('/')
      .expect(200, '', done);
  });
  describe('res.cookie()', function() {
    it('should set cookie', function(done) {
      var f = Rama.exec(new Rama.Cookies(), function(req, res) {
        res.cookie('test', 'Test!').end();
      });
      request(f)
      .get('/')
      .end(function(err, res) {
        res.headers['set-cookie'][0].should.containEql('test=Test!');
        done();
      });
    });
    it('should set cookie with expires by Date', function(done) {
      var date = new Date();
      var f = Rama.exec(new Rama.Cookies(), function(req, res) {
        res.cookie('test', 'Test!', { expires: date }).end();
      });
      request(f)
      .get('/')
      .end(function(err, res) {
        res.headers['set-cookie'][0].should.containEql('Expires=' + date.toUTCString());
        done();
      });
    });
    it('should set cookie with expires by timeout', function(done) {
      var f = Rama.exec(new Rama.Cookies(), function(req, res) {
        res.cookie('test', 'Test!', { expires: 1 }).end();
      });
      request(f)
      .get('/')
      .end(function(err, res) {
        res.headers['set-cookie'][0].should.containEql('Expires=');
        done();
      });
    });
    it('should remove cookie', function(done) {
      var f = Rama.exec(new Rama.Cookies(), function(req, res) {
        res.cookie('test', null).end();
      });
      request(f)
      .get('/')
      .end(function(err, res) {
        res.headers['set-cookie'][0].should.containEql('Expires=' + (new Date(1).toUTCString()));
        done();
      });
    });
  });
  describe('req.cookies', function() {
    it('should get previously set cookie', function(done) {
      var f = Rama.exec(new Rama.Cookies(), function(req, res) {
        if(req.url === '/set') {
          res.cookie('test', 'Test!').end();
        } else {
          req.cookies.should.have.property('test', 'Test!');
          res.end();
        }
      });
      var agent = request.agent(f);
      // FIXME!!!
      agent
      .get('/set')
      .expect(200, '', function() {
        agent
        .get('/get')
        .expect(200, '', done);
      });
    });
  });
});
