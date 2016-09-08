var chai = require('chai');
var expect = chai.expect;
var app = require('../../../app');
var request = require('supertest');

var agent = request.agent(app);

before(function(done) {
  agent
    .get('/api/login/masquerade/john.doe@ph.ibm.com')
    .send()
    .end(function(err, res) {
      if (err) throw err;
      agent.saveCookies(res);
      done();
    })
});

describe('Users API Test [GET /api/users/admins]: get admins', function() {
  it('It will return admins successfully', function(done) {
    var req = request(app).get('/api/users/admins/');
    agent.attachCookies(req);
    req.expect(200);
    req.end(function(err, res) {
      if (err) {
        //console.log(err);
      } else {
        expect(res.body).to.be.a('object');
        expect(res.body).to.have.property('ACL_Full_Admin');
        expect(res.body).to.have.property('ACL_User_Supt');
      }
      done();
    });
  });
});