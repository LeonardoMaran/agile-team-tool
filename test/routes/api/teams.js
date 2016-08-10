var chai = require('chai');
var expect = chai.expect;
var app = require('../../../app');
var request = require('supertest');
var dummyData = require('../../data/dummy-data.js');
var common = require('../../../models/cloudant-driver.js');
var teamModel = require('../../../models/teams.js');
var teamDocValid = dummyData.teams.validDoc;
var teamDocInvalid = dummyData.teams.invalidDoc;
var teamDocUpdateInvalid = dummyData.teams.validDoc;
var teamDocUpdateValid = dummyData.teams.validDoc;
var userValidEmail = dummyData.user.details.shortEmail;
var adminUser = 'Yanliang.Gu1@ibm.com';
var adminInfo = null;
var createdId = null;
var targetParentId = null;
var targetChildId = null;
var agent = request.agent(app);

describe('Team API Tests', function() {

  // do the login befre testing
  this.timeout(30000);
  before(function(done) {
    agent
      .get('/api/login/masquerade/' + adminUser)
      .send()
      .end(function(err, res) {
        if (err) throw err;
        //call home page to initialize session data
        agent
          .get('/')
          .send()
          .end(function(err, res) {
            if (err) throw err;
            agent.saveCookies(res);
            done();
          })
      })
  });

  after(function(done){
    deleteCreatedRecord(createdId);
    deleteCreatedRecord(targetParentId);
    deleteCreatedRecord(targetChildId);
    done();
  })

  function deleteCreatedRecord(recordId){
    teamModel.getTeam(recordId)
      .then(function(result){
        if (result.doc_status == 'delete') {
          common.deleteRecord(result._id, result._rev)
            .then(function(result){
            })
            .catch(function(err){
            });
        }
      })
      .catch(function(err){
      });
  };

  it('it will return 400 because team docment is not valid', function(done){
    var req = request(app).post('/api/teams');
    agent.attachCookies(req);
    req.send(teamDocInvalid);
    req.end(function(err, res){
      if (err) {
        //console.log(err);
      } else {
        expect(res.statusCode).to.be.equal(400);
        expect(res.body).to.not.equal(null);
        expect(res.body).to.have.property('error');
        expect(res.body.error).to.be.a('object');
      }
      done();
    });
  });

  it('it will return 201 when you create a team successfully',function(done){
    var req = request(app).post('/api/teams');
    agent.attachCookies(req);
    req.send(teamDocValid);
    req.end(function(err,res){
      if (err) {
        //console.log(err);
      } else {
        expect(res.statusCode).to.be.equal(201);
        expect(res.body).to.have.property('_id');
        createdId = res.body['_id'];
      }
      done();
    });
  });

  it('it will return 400 when you associate a team with wrong action',function(done){
    var req = request(app).put('/api/teams/associates');
    agent.attachCookies(req);
    req.send({});
    req.end(function(err,res){
      if (err) {
        //console.log('err: ', err);
      } else {
        expect(res.statusCode).to.be.equal(400);
        expect(res.body).to.have.property('error');
        expect(res.body.error).to.be.equal('Invalid action');
      }
      done();
    });
  });

  it('it will return 201 when you create a team successfully for team association endpoint to be a parent',function(done){
    var req = request(app).post('/api/teams');
    agent.attachCookies(req);
    var teamAssoc = dummyData.associate.validDoc();
    req.send(teamAssoc);
    req.end(function(err,res){
      if (err) {
        //console.log(err);
      } else {
        expect(res.statusCode).to.be.equal(201);
        expect(res.body).to.have.property('_id');
        targetParent = res.body['_id'];
        targetParentId = res.body['_id'];
      }
      done();
    });
  });

  it('it will return 201 when you create a team successfully for team association endpoint to be a child',function(done){
    var req = request(app).post('/api/teams');
    agent.attachCookies(req);
    var teamAssoc = dummyData.associate.validDoc();
    req.send(teamAssoc);
    req.end(function(err,res){
      if (err) {
        //console.log(err);
      } else {
        expect(res.statusCode).to.be.equal(201);
        expect(res.body).to.have.property('_id');
        targetParentTeamId = res.body['_id'];
        targetChildId = res.body['_id'];
      }
      done();
    });
  });

  it('it will return 200 when associating a team',function(done){
    this.timeout(30000);
    var req = request(app).put('/api/teams/associates');
    agent.attachCookies(req);
    var putBody = {
      'action' : 'associateParent',
      'teamId' : targetParentTeamId,
      'targetParent' : targetParent
    };
    req.send(putBody);
    req.end(function(err,res){
      if (err) {
        //console.log('err: ', err);
      } else {
        expect(res.statusCode).to.be.equal(200);
      }
      done();
    });
  });

  // TODO: need additional test case for other team associate endpoint valid ACTION, ie. 'associateParent', 'associateChild', 'removeParent', 'removeChild'

  it('it will return 400 because Team document ID is none existing', function(done){
    var docu = { '_id' : 'none-existing-docu' + new Date().getTime() };
    var req = request(app).put('/api/teams');
    agent.attachCookies(req);
    req.send(docu);
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

  it('it will return 400 because update data is invalid', function(done){
    teamDocUpdateInvalid['parent_team_id']=createdId;
    var req = request(app).put('/api/teams');
    agent.attachCookies(req);
    req.send(teamDocUpdateInvalid);
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

  it('it will return 200 after updating document', function(done){
    teamDocUpdateValid = dummyData.teams.validUpdateDoc();
    teamDocUpdateValid['_id'] = createdId;
    delete teamDocUpdateValid['parent_team_id'];
    var req = request(app).put('/api/teams');
    agent.attachCookies(req);
    req.send(teamDocUpdateValid);
    req.end(function(err, res){
      if (err) {
        //console.log(err);
      } else {
        expect(res.statusCode).to.be.equal(200);
        expect(res.body).to.have.property('_id');
        expect(res.body._id).to.be.equal(createdId);
      }
      done();
    });
  });

  // Get teams api tests
  it('it will return 200 for retrieving all teams successfully', function(done){
    var req = request(app).get('/api/teams');
    agent.attachCookies(req);
    req.end(function(err,res){
      if (err) {
        //console.log(err);
      } else {
        expect(res.statusCode).to.be.equal(200);
        expect(res.body).to.be.a('array');
        expect(res.body[0]).to.have.property('id');
      }
      done();
    });
  });

  it('it will return 400 and return empty because none existent team details', function(done){
    var req = request(app).get('/api/teams/'+'none-existing-team');
    agent.attachCookies(req);
    req.end(function(err,res){
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

  it('it will return 200 and team details', function(done){
    var req = request(app).get('/api/teams/' + createdId);
    agent.attachCookies(req);
    req.end(function(err,res){
      if (err) {
        //console.log(err);
      } else {
        expect(res.statusCode).to.be.equal(200);
        expect(res.body).to.be.a('object');
        expect(res.body).to.have.property('type');
      }
      done();
    });
  });

  // Get team roles api test
  it('it will return 200 and retrieve all team role types', function(done){
    var req = request(app).get('/api/teams/roles');
    agent.attachCookies(req);
    req.end(function(err,res){
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

  // Get by names api tests
  it('it will return 200 and retrieve all team names', function(done){
    var req = request(app).get('/api/teams/names');
    agent.attachCookies(req);
    req.end(function(err,res){
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

  it('it will return 200 and return empty details for none existing team name', function(done){
    var req = request(app).get('/api/teams/names/' + 'none-existing-team-name');
    agent.attachCookies(req);
    req.end(function(err, res){
      if (err) {
        //console.log(err);
      } else {
        expect(res.statusCode).to.be.equal(200);
        expect(res.body).to.be.empty;
      }
      done();
    });
  });

  it('it will return 200 and details for team name', function(done){
    var req = request(app).get('/api/teams/names/' + teamDocUpdateValid['name']);
    agent.attachCookies(req);
    req.end(function(err, res){
      if (err) {
        //console.log(err);
      } else {
        expect(res.statusCode).to.be.equal(200);
        expect(res.body[0]).to.have.property('key');
        expect(res.body[0]['key']).to.be.equal(teamDocUpdateValid['name']);
      }
      done();
    });
  });

  // Get by email api tests
  it('it will return 400 because invalid email address', function(done){
    var req = request(app).get('/api/teams/members/' + 'invalid-email-add');
    agent.attachCookies(req);
    req.end(function(err, res){
      if (err) {
        //console.log(err);
      } else {
        expect(res.statusCode).to.be.equal(400);
        expect(res.body).to.have.property('error');
        expect(res.body.error).to.have.property('email');
      }
      done();
    });
  });

  it('it will return 200 and empty team lists because email without team', function(done){
    var req = request(app).get('/api/teams/members/' + 'emailWithoutTeam@email.com');
    agent.attachCookies(req);
    req.end(function(err, res){
      if (err) {
        //console.log(err);
      } else {
        expect(res.statusCode).to.be.equal(200);
        expect(res.body).to.be.empty;
      }
      done();
    });
  });

  it('it will return 200 and team lists for this email', function(done){
    var req = request(app).get('/api/teams/members/' + userValidEmail);
    agent.attachCookies(req);
    req.end(function(err, res){
      if (err) {
        //console.log(err);
      } else {
        expect(res.statusCode).to.be.equal(200);
        expect(res.body[0]).to.have.property('key');
        expect(res.body[0]['key']).to.be.equal(userValidEmail);
      }
      done();
    });
  });

  // Delete api test
  it('it will return 400 because delete status not equal to delete', function(done){
    teamDocUpdateValid['doc_status'] = '';
    teamDocUpdateValid['_id'] = createdId;
    var req = request(app).delete('/api/teams');
    agent.attachCookies(req);
    req.send(teamDocUpdateValid);
    req.end(function(err, res){
      if (err) {
        //console.log(err);
      } else {
        expect(res.statusCode).to.be.equal(400);
        expect(res.body).to.have.property('error');
        expect(res.body.error).to.be.equal('Invalid request');
      }
      done();
    });
  });

  it('it will return 400 because id is empty', function(done){
    teamDocUpdateValid['doc_status'] = 'delete';
    teamDocUpdateValid['_id'] = '';
    var req = request(app).delete('/api/teams');
    agent.attachCookies(req);
    req.send(teamDocUpdateValid);
    req.end(function(err, res){
      if (err) {
        //console.log(err);
      } else {
        expect(res.statusCode).to.be.equal(400);
        expect(res.body).to.have.property('error');
        expect(res.body.error).to.be.equal('Team documents id is required');
      }
      done();
    });
  });

  it('it will return 204 after deleting associate document1', function(done){
    var teamAssoc = dummyData.associate.validDoc();
    teamAssoc['doc_status'] = 'delete';
    teamAssoc['_id'] = targetParentId;
    var req = request(app).delete('/api/teams');
    agent.attachCookies(req);
    req.send(teamAssoc);
    req.end(function(err, res){
      if (err) {
        //console.log(err);
      } else {
        expect(res.statusCode).to.be.equal(204);
        expect(res.body).to.be.empty;
      }
      done();
    });
  });

  it('it will return 204 after deleting associate document2', function(done){
    var teamAssoc = dummyData.associate.validDoc();
    teamAssoc['doc_status'] = 'delete';
    teamAssoc['_id'] = targetChildId;
    var req = request(app).delete('/api/teams');
    agent.attachCookies(req);
    req.send(teamAssoc);
    req.end(function(err, res){
      if (err) {
        //console.log(err);
      } else {
        expect(res.statusCode).to.be.equal(204);
        expect(res.body).to.be.empty;
      }
      done();
    });
  });

  it('it will return 204 after deleting document', function(done){
    teamDocUpdateValid['doc_status'] = 'delete';
    teamDocUpdateValid['_id'] = createdId;
    var req = request(app).delete('/api/teams');
    agent.attachCookies(req);
    req.send(teamDocUpdateValid);
    req.end(function(err, res){
      if (err) {
        //console.log(err);
      } else {
        expect(res.statusCode).to.be.equal(204);
        expect(res.body).to.be.empty;
      }
      done();
    });
  });


  it('it will return 200 to get top level teams', function(done){
    var req = request(app).get('/api/teams?parent_team_id');
    agent.attachCookies(req);
    req.end(function(err, res){
      if (err) {
        //console.log(err);
      } else {
        expect(res.statusCode).to.be.equal(200);
        expect(res.body).to.have.property('docs');
      }
      done();
    });
  });
});
