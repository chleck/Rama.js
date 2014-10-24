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
  describe('req.cookie()', function() {
    it('should set cookie', function(done) {
      var f = Rama.exec(new Rama.Cookies(), function(req, res) {
        return res.end();
        if(req.url === '/set') {
          res.cookie('test', 'Test!').end();
        } else {
          req.cookies.should.have.property('test', 'Test!');
          res.end();
        }
      });
      var agent = request.agent(f);
      agent
      .get('/set')
      .expect(200, '')
      .expect(200, '', function() {
        agent
        .get('/get')
        .expect(200, '', done);
      });
    });
  });
});
