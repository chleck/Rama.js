'use strict';

var request = require('supertest');

var Rama = require('..');

describe('Static', function() {
  it('should return a Static middleware', function() {
    var srv = new Rama.Static();
    srv.should.be.a.Function;
  });
  it('should serve files', function(done) {
    var f = new Rama.Static({ prefix: '', root: __dirname + '/files' });
    request(f)
      .get('/test.txt')
      .expect(200, 'Test!', done);
  });
  // describe('req.cookie()', function() {
  //   it('should set cookie', function(done) {
  //     var f = Rama.exec(new Rama.Static(), function(req, res) {
  //       return res.end();
  //       if(req.url === '/set') {
  //         res.cookie('test', 'Test!').end();
  //       } else {
  //         req.Static.should.have.property('test', 'Test!');
  //         res.end();
  //       }
  //     });
  //     var agent = request.agent(f);
  //     agent
  //     .get('/set')
  //     .expect(200, '')
  //     .expect(200, '', function() {
  //       agent
  //       .get('/get')
  //       .expect(200, '', done);
  //     });
  //   });
  // });
});
