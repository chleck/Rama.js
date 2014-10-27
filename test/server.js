'use strict';

var http = require('http');
var https = require('https');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

var Rama = require('..');

describe('Rama', function() {
  it('should return a Rama instance', function() {
    var rama = new Rama(function() {} );
    rama.should.be.an.Object;
  });
  describe('.listen(host, port, cert, key)', function() {
    it('should add HTTP server if cert and key is not defined', function() {
      var rama = new Rama(function() {} );
      rama.listen('localhost', 9081);
    });
  });
  describe('.listen(host, port, cert, key)', function() {
    it('should add HTTPS server if cert and key is defined', function() {
      var rama = new Rama(function() {} );
      rama.listen('localhost', 9082, __dirname + '/files/cert.pem', __dirname + '/files/key.pem');
    });
  });
  describe('.run()', function() {
    // it('should run HTTP server', function(done) {
    //   var rama = new Rama(function(req, res, next) {
    //     next();
    //   });
    //   rama.listen('localhost', 9081).run();
    //   http.get('http://localhost:9081', function(res) {
    //     res.statusCode.should.eql(200);
    //     done();
    //   }).on('error', function(e) {
    //     throw e;
    //   });
    // });
    it('should run HTTPS server', function(done) {
      var rama = new Rama(function(req, res, next) {
        next();
      });
      rama.listen('localhost', 9082, __dirname + '/files/cert.pem', __dirname + '/files/key.pem').run();
      https.get('https://localhost:9082', function(res) {
        res.statusCode.should.eql(200);
        done();
      }).on('error', function(e) {
        throw e;
      });
    });
  });
  it('should not fail on middleware exception', function(done) {
    var rama = new Rama(function(req, res, next) {
      // next();
      throw new Error('Test exception');
    });
    rama.listen('localhost', 9083).run();
    http.get('http://localhost:9083', function(res) {
      res.statusCode.should.eql(200);
      done();
    }).on('error', function(e) {
      throw e;
    });
  });
});
