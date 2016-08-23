var querystring = require('querystring');
var chai = require('chai');
var crypto = require('crypto');
var expect = chai.expect;
var request = require('supertest');
var iterationModel = require('../../../models/iteration');
var teamModel = require('../../../models/teams');
var iterationTestData = require('../../data/iteration.js');
var app = require('../../../app');
var validId;
var validTeamId;
var docId;
var iterationId;
var adminUser = 'Yanliang.Gu1@ibm.com';
var timeout = 100000;

var iterationDocValid = iterationTestData.iterationDocValid;
iterationDocValid.last_updt_user = adminUser;

var iterationDoc_duplicateIterName = iterationTestData.iterationDoc_duplicateIterName;
iterationDoc_duplicateIterName.last_updt_user = adminUser;

var iterationDocValid_sample2 = iterationTestData.iterationDocValid_sample2;
iterationDocValid_sample2.last_updt_user = adminUser;

var iterationDocValid_sample3 = iterationTestData.iterationDocValid_sample3;

var iterationDocInvalid = iterationTestData.iterationDocInvalid;
iterationDocInvalid.last_updt_user = adminUser;

var agent = request.agent(app);

var teamDocValid = iterationTestData.teamDocValid;
var userDetails = iterationTestData.userDetails;
var userTeams = iterationTestData.userTeams;
var allTeams = iterationTestData.allTeams;
var user = iterationTestData.user;

describe('Iteration API Test', function(){
  before(function(done) {
    // If team document 'testteamid_1' does not exist lets create it because iteration info needs it
    var teamName = 'testteamid_1';
    teamModel.getName(teamName)
    .then(function(result) {
      if (result.length === 0) {
        teamModel.createTeam(teamDocValid, userDetails)
        .then(function(body) {
          expect(body).to.be.a('object');
          expect(body).to.have.property('_id');
          var createdId = body['_id'];
          validTeamId = body['name'];
        }).catch(function(err) {});
      } else {
        validTeamId = result[0].key;
      }
    })
    .finally(function() {
      // done();
      // do the login befre testing
      agent
        .get('/api/login/masquerade/' + adminUser)
        .end(function(err, res) {
          if (err) throw err;
          agent.saveCookies(res);
          done();
        });
    });
  });

  // delete the iteration file created in the test
  after(function(done) {
    // console.log('Attempt to delete Doc1 docId: '+ iterationId);
    iterationModel.get(iterationId)
    .then(function(result) {
      var _id = result._id;
      var _rev = result._rev;
      iterationModel.delete(_id, _rev)
      .then(function(result) {
         //console.log('Successfully deleted Doc1 docId: '+_id);
      })
      .catch(function(err) {
         //console.log('Err: Attempt to delete Doc1 docId: ' + _id);
        expect(err).to.not.equal(null);
      });
    })
    .catch(function(err) {
       //console.log('Err: Attempt to delete Doc1 docId: ' + iterationId);
      expect(err).to.not.equal(null);
    })
    .finally(function() {
      done();
    });
  });

  describe('Iteration API Test [POST /api/iteration]: add team iteration document', function(){
    this.timeout(timeout);
    it('It will successfully add new iteration document', function(done){
      var req = request(app).post('/api/iteration');
      agent.attachCookies(req);
      req.send(iterationDocValid);
      req.end(function(err, res){
        if (err) {
          //console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(200);
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.property('id');
          expect(res.body).to.have.property('ok');
          expect(res.body.ok).to.be.equal(true);
          iterationId = res.body.id;
        }
        done();
      });
    });

    it('It will fail to add invalid iteration document', function(done){
      var req =request(app).post('/api/iteration');
      agent.attachCookies(req);
      req.send(iterationDocInvalid);
      req.end(function(err, res){
        if (err) {
          //console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(400);
          expect(res.body).to.have.property('error');
        }
        done();
      });
    });

    it('It will fail with empty document', function(done){
      var req =request(app).post('/api/iteration');
      agent.attachCookies(req);
      req.end(function(err, res){
        if (err) {
          //console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(400);
          expect(res.body).to.have.property('error');
        }
        done();
      });
    });
  });

  describe('Iteration API Test [GET /api/iteration/]: get iteration doucments', function(){
    this.timeout(timeout);
    it('Get all team iteration documents', function(done){
      var req = request(app).get('/api/iteration/');
      agent.attachCookies(req);
      req.end(function(err, res){
        if (err) {
          //console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(200);
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.property('rows');
        }
        done();
      });
    });

    it('Get team iteration docs by key', function(done){
      // var validTeamId = iterationDocValid.team_id;
      var req = request(app).get('/api/iteration/' + validTeamId);
      agent.attachCookies(req);
      req.end(function(err, res){
        if (err) {
          // console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(200);
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.property('rows');
          expect(res.body.rows[0]).to.have.property('key');
          expect(res.body.rows[0].key).to.be.equal(validTeamId);
        }
        done();
      });
    });

    it('Get non-existing team iteration document', function(done){
      var invalidTeamId = '11111111';
      var req = request(app).get('/api/iteration/' + invalidTeamId);
      agent.attachCookies(req);
      req.end(function(err, res){
        if (err) {
          //console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(200);
          expect(res.body).to.have.property('rows');
          expect(res.body.rows).to.be.empty;
        }
        done();
      });
    });
  });

  describe('Iteration API Test [GET /api/iteration/searchTeamIteration]: Search team iteration', function(){
    it('Search by team id', function(done) {
      var query = querystring.stringify({'id':iterationDocValid._id});
      var req = request(app).get('/api/iteration/searchTeamIteration?' + query);
      agent.attachCookies(req);
      req.end(function(err, res){
        if (err) {
          //console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(200);
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.property('rows');
        }
        done();
      });
    });

    it('Search by team id with startdate/enddate', function(done) {
      var query = querystring.stringify({'id':iterationDocValid._id, 'startdate': '20160701', 'enddate': '20160701'});
      var req = request(app).get('/api/iteration/searchTeamIteration?' + query);
      agent.attachCookies(req);
      req.end(function(err, res){
        if (err) {
          //console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(200);
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.property('rows');
        }
        done();
      });
    });

    it('Search by team id with startdate <= enddate', function(done) {
      var query = querystring.stringify({'id':iterationDocValid_sample3._id, 'startdate': '20160801', 'enddate': '20160814'});
      var req = request(app).get('/api/iteration/searchTeamIteration?' + query);
      agent.attachCookies(req);
      req.end(function(err, res){
        if (err) {
          //console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(200);
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.property('rows');
        }
        done();
      });
    });

    it('Missing TeamId', function(done) {
      var req = request(app).get('/api/iteration/searchTeamIteration');
      agent.attachCookies(req);
      req.end(function(err, res){
        if (err) {
          // console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(400);
          expect(res.body.error).to.be.equal('TeamId is required');
        }
        done();
      });
    });

    it('Cannot retrieve documents with invalid status', function(done) {
      var query = querystring.stringify({'id':iterationDocValid._id, 'status': 'X'});
      var req = request(app).get('/api/iteration/searchTeamIteration?' + query);
      agent.attachCookies(req);
      req.end(function(err, res){
        if (err) {
          // console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(400);
          expect(res.body).to.have.property('error');
          expect(res.body.error).to.have.property('status');
        }
        done();
      });
    });

    it('Successfully fetch documents with valid status', function(done) {
      var query = querystring.stringify({'id':iterationDocValid._id, 'status': 'Y'});
      var req = request(app).get('/api/iteration/searchTeamIteration?' + query);
      agent.attachCookies(req);
      req.end(function(err, res){
        if (err) {
          // console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(200);
          expect(res.body).to.have.property('rows');
        }
        done();
      });
    });

    it('Successfully fetch documents with valid startdate', function(done) {
      var query = querystring.stringify({'id':iterationDocValid._id, 'startdate': '20160820'});
      var req = request(app).get('/api/iteration/searchTeamIteration?' + query);
      agent.attachCookies(req);
      req.end(function(err, res){
        if (err) {
          // console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(200);
          expect(res.body).to.have.property('rows');
        }
        done();
      });
    });

    it('Cannot retrieve documents with invalid startdate', function(done) {
      var query = querystring.stringify({'id':iterationDocValid._id, 'startdate': '12345678'});
      var req = request(app).get('/api/iteration/searchTeamIteration?' + query);
      agent.attachCookies(req);
      req.end(function(err, res){
        if (err) {
          // console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(400);
          expect(res.body).to.have.property('error');
          expect(res.body.error).to.have.property('startdate');
        }
        done();
      });
    });

    it('Successfully fetch documents with valid enddate', function(done) {
      var query = querystring.stringify({'id':iterationDocValid._id, 'enddate': '20160820'});
      var req = request(app).get('/api/iteration/searchTeamIteration?' + query);
      agent.attachCookies(req);
      req.end(function(err, res){
        if (err) {
          // console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(200);
          expect(res.body).to.have.property('rows');
        }
        done();
      });
    });

    it('Cannot retrieve documents due to invalid enddate', function(done) {
      var query = querystring.stringify({'id':iterationDocValid._id, 'enddate': '12345678'});
      var req = request(app).get('/api/iteration/searchTeamIteration?' + query);
      agent.attachCookies(req);
      req.end(function(err, res){
        if (err) {
          // console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(400);
          expect(res.body).to.have.property('error');
          expect(res.body.error).to.have.property('enddate');
        }
        done();
      });
    });
  });

  describe('Iteration API Test [GET /api/iteration/completed]: get completed iteration', function(){
    it('Get completed iteration documents', function(done){
      var query = querystring.stringify({'startkey':iterationDocValid.iteration_start_dt});
      var req = request(app).get('/api/iteration/completed?' + query);
      agent.attachCookies(req);
      req.end(function(err, res){
        if (err) {
          //console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(200);
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.property('rows');
        }
        done();
      });
    });
  });

  describe('Iteration API Test [PUT /api/iteration/]: update iteration document', function(){
    this.timeout(timeout);
    it('It will successfully update iteration document', function(done){
      var req = request(app).put('/api/iteration/' + iterationId);
      iterationDocValid_sample2._id = iterationId;
      agent.attachCookies(req);
      req.send(iterationDocValid_sample2);
      req.end(function(err, res){
          //console.log(res.body);
        if (err) {
          //console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(200);
          expect(res.body).to.have.property('id');
          expect(res.body.id).to.be.equal(iterationId);
        }
        done();
      });
    });

    it('It will fail to update without iterationId', function(done){
      var req = request(app).put('/api/iteration/');
      agent.attachCookies(req);
      req.send(iterationDocValid_sample2);
      req.end(function(err, res){
        if (err) {
          //console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(400);
          expect(res.body).to.have.property('error');
          expect(res.body.error).to.be.equal('iterationId is missing');
        }
        done();
      });
    });

    it('It will fail to update without document', function(done){
      var req = request(app).put('/api/iteration/' + iterationId);
      var emptyDoc = '';
      agent.attachCookies(req);
      req.send(emptyDoc);
      req.end(function(err, res){
        if (err) {
          //console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(400);
          expect(res.body).to.have.property('error');
          expect(res.body.error).to.be.equal('Iteration data is missing');
        }
        done();
      });
    });

    it('It will fail to update without invalid document', function(done){
      var req = request(app).put('/api/iteration/' + iterationId);
      agent.attachCookies(req);
      req.send(iterationDocInvalid);
      req.end(function(err, res){
        if (err) {
          //console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(400);
          expect(res.body).to.have.property('error');
        }
        done();
      });
    });
  });

  describe('Iteration API Test [GET /api/iteration/current]: get iteration doc by id', function(){
    after(function(done) {
      iterationModel.getByIterInfo(validTeamId)
      .then(function(result) {
        if (result && result.rows.length > 0) {
          for(i=0; i < result.rows.length; i++) {
            var id = result.rows[i].id;
            var rev = result.rows[i].value._rev;
              iterationModel.delete(id, rev)
              .then(function(res) {
              }).catch(function(err) {});
          }
        }
      })
      .finally(function() {
        done();
      });
    });

    it('It will successfully get iteration document', function(done){
      var req = request(app).get('/api/iteration/current/' + iterationId);
      agent.attachCookies(req);
      req.end(function(err, res){
        if (err) {
          //console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(200);
          expect(res.body).to.have.property('_id');
          expect(res.body._id).to.be.equal(iterationId);
        }
        done();
      });
    });

    it('It will fail to get iteration document with invalid id', function(done){
      var req = request(app).get('/api/iteration/current/' + 'undefined');
      agent.attachCookies(req);
      req.end(function(err, res){
        if (err) {
          //console.log(err);
        } else {
          expect(res.statusCode).to.be.equal(400);
          expect(res.body).to.have.property('error');
          expect(res.body.error).to.be.equal('not_found');
        }
        done();
      });
    });
  });
});
