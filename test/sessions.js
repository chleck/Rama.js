'use strict';

var request = require('supertest');

var Rama = require('..');

describe('Sessions', function() {
  it('should return a Sessions middleware', function() {
    var sessions = new Rama.Sessions();
    sessions.should.be.a.Function;
  });
  it('should extend HTTP request', function(done) {
    var f = Rama.exec(new Rama.Cookies(), new Rama.Sessions(), function(req, res) {
      req.should.have.property('session');
      req.session.should.be.an.Object;
      res.end();
    });
    request(f)
      .get('/')
      .expect(200, '', done);
  });
  it('should save/restore session data', function(done) {
    var f = Rama.exec(new Rama.Cookies(), new Rama.Sessions(), function(req, res) {
      if(req.url === '/set') {
        req.session.test = 'Test!';
        res.end();
      } else {
        req.session.should.have.property('test', 'Test!');
        res.end();
      }
    });
    var agent = request.agent(f);
    agent
    .get('/set')
    .expect(200, '', function() {
      agent
      .get('/get')
      .expect(200, '', done);
    });
  });
});
