var request = require('supertest');

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
      rama.listen('localhost', 9082, './cert/cert.pem', './cert/key.pem');
    });
  });
});
