var request = require('supertest');

var Rama = require('..');
var Body = Rama.Body;

describe('Body', function() {
  it('should return a Body middleware', function() {
    var body = new Rama.Body();
    body.should.be.a.Function;
  });
  it('should extend HTTP request with .body property', function(done) {
    var f = Rama.exec(new Rama.Body(), function(req, res) {
      req.should.have.property('body');
      req.body.should.be.an.Object;
      req.body.should.have.property('a', 'Test!');
      res.end();
    });
    request(f)
      .post('/')
      .send({ a: 'Test!' })
      .expect(200, '', done);
  });
  it('should extend HTTP request with .files property', function(done) {
    var f = Rama.exec(new Rama.Body(), function(req, res) {
      req.should.have.property('files');
      req.files.should.be.an.Object;
      req.files.should.have.property('certificate');
      req.files.certificate.should.have.property('name', 'cert.pem');
      req.files.certificate.should.have.property('size');
      res.end();
    });
    request(f)
      .post('/')
      .attach('certificate', __dirname + '/files/cert.pem')
      .expect(200, '', done);
  });
});
