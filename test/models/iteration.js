var chai = require('chai');
var crypto = require('crypto');
var _ = require('underscore');
var moment = require('moment');
var expect = chai.expect;
var iterationModel = require('../../models/iteration');
var common = require('../../models/cloudant-driver');
var teamModel = require('../../models/teams');
var dummyData = require('../data/iteration.js');
var util = require('../../helpers/util');
var timeout = 100000;
var validId;
var validTeamId;
var iterationId;
var iterationName;
var iterationRev;
var iterationName;
var iterationDocValid = dummyData.iterationDocValid;
var iterationDoc_duplicateIterName = dummyData.iterationDoc_duplicateIterName;
var iterationDocValid_sample2 = dummyData.iterationDocValid_sample2;
var iterationDocValid_sample3 = dummyData.iterationDocValid_sample3;

var iterationDocInvalid = dummyData.iterationDocInvalid;
var teamDocValid = dummyData.teamDocValid;
var user = dummyData.user;
var userDetails = dummyData.userDetails;

describe('Iteration Model', function() {
  before(function(done) {
    var teamName = 'testteamid_1';
    var bulkDeleteIds = [];
    this.timeout(10000);
    teamModel.getByName(teamName)
      .then(function(result) {
        if (result.length === 0) {
          return teamModel.createTeam(teamDocValid, userDetails); // (A)teamModel.createTeam
        }
        else {
          validId = result[0].id;
          // console.log('\nvalidId 2:', validId, '\n');
          return iterationModel.getByIterInfo(validId); // (B)iterationModel.getByIterInfo
        }
      })
      .then(function(result) { // results coming from (B)iterationModel.getByIterInfo()
        // console.log('\nresult 111:', result, '\n');
        if (result && result.rows && result.rows.length > 0) {
          // console.log('\nTOTAL ROWS 2:', result.rows.length, '\n');
          for (i = 0; i < result.rows.length; i++) {
            var id = result.rows[i].id;
            bulkDeleteIds.push(id);
          }
          return util.BulkDelete(bulkDeleteIds); // (B)util.BulkDelete
        }
        else { // results coming from (A)teamModel.createTeam()
          // console.log('\nresult 222:', result, '\n');
          if (result && result['_id']) {
            validId = result['_id'];
            validTeamId = result['name'];
            // console.log('\nvalidId 1:', validId, '\n');
            return iterationModel.getByIterInfo(validId); // (A)iterationModel.getByIterInfo
          }
        }
      })
      .then(function(result) { // result coming from (A)iterationModel.getByIterInfo()
        // console.log('\nresult 333:', result, '\n');
        if (result && result.rows && result.rows.length > 0) {
          // console.log('TOTAL ROWS 1:', result.rows.length, '\n');
          for (i = 0; i < result.rows.length; i++) {
            var id = result.rows[i].id;
            bulkDeleteIds.push(id);
          }
          return util.BulkDelete(bulkDeleteIds); // (A)util.BulkDelete
        }
      })
      .then(function(results) {
        done();
      });
  });

  after(function(done) {
    var bulkDeleteIds = [];
    this.timeout(10000);
    if (validId) {
      // console.log('\nAFTER validId:', validId, '\n');
      iterationModel.getByIterInfo(validId)
        .then(function(result) {
          if (result && result.rows && result.rows.length > 0) {
            for (i = 0; i < result.rows.length; i++) {
              var id = result.rows[i].id;
              bulkDeleteIds.push(id);
            }
            // Delete the created Team document 'testteamid_1' that is used for testing
            bulkDeleteIds.push(validId);
            return util.BulkDelete(bulkDeleteIds);
          }
        })
        .then(function(result) {
          done();
        });
    } else {
      done();
    }
  });

  describe('[add]: Add team iteration document', function() {
    this.timeout(timeout);
    before(function(done) {
      var iterId = 'testmyid';
      this.timeout(10000);
      iterationModel.get(iterId)
        .then(function(result) {
          iterationDoc_duplicateIterName.team_id = validId;
          return iterationModel.add(iterationDoc_duplicateIterName, user);
        })
        .then(function(result) {
          done();
        })
        .catch(function(err) {
          iterationDoc_duplicateIterName.team_id = validId;
          return iterationModel.add(iterationDoc_duplicateIterName, user);
        })
        .then(function(result) {
          done();
        })
        .catch(function(err) {
          done();
        });
    });

    it('It will successfully add new iteration document', function(done) {
      iterationDocValid.team_id = validId;
      iterationDocValid.iteration_name = 'testiterationname-' + crypto.randomBytes(4).toString('hex');
      iterationModel.add(iterationDocValid, user)
        .then(function(result) {
          iterationId = result.id;
          iterationRev = result.rev;
          expect(result).to.be.a('object');
          expect(result).to.have.property('id');
          expect(result.ok).to.be.equal(true);
          done();
        })
        .catch(function(err) {
          done();
        });
    });

    it('Return Iteration no/identifier already exists', function(done) {
      iterationDoc_duplicateIterName.team_id = validId;
      iterationModel.add(iterationDoc_duplicateIterName, user)
        .catch(function(err) {
          expect(err).to.not.equal(null);
          expect(err).to.have.property('error');
          expect(err.error).to.have.property('iteration_name');
          expect(err.error['iteration_name']).to.not.empty;
          expect(err.error['iteration_name'][0]).to.contain('exists');
          done();
        });
    });

    it('It will fail to add iteration document', function(done) {
      iterationDocInvalid.team_id = validId;
      iterationModel.add(iterationDocInvalid, user)
        .catch(function(err) {
          expect(err).to.have.property('error');
          done();
        });
    });

    it('Saved iteration docs with the same start & end date', function(done) {
      var doc = _.clone(iterationDocValid_sample3);
      doc._id = 'testmyid-' + crypto.randomBytes(20).toString('hex');
      doc.iteration_name = 'testiterationname-' + crypto.randomBytes(5).toString('hex');
      var currentDate = moment().format('MM/DD/YYYY');
      doc.iteration_start_dt = currentDate;
      doc.iteration_end_dt = currentDate;
      doc.client_sat = '';
      doc.team_sat = '';
      doc.nbr_stories_dlvrd = '';
      doc.team_id = validId;
      iterationModel.add(doc, user)
        .then(function(result) {
          expect(result).to.be.a('object');
          expect(result).to.have.property('id');
          expect(result.ok).to.be.equal(true);
          done();
        })
        .catch(function(err) {
          done();
        });
    });

    it('Saved iteration doc with default values', function(done) {
      var doc = _.clone(iterationDocValid_sample3);
      doc._id = 'testmyid-' + crypto.randomBytes(20).toString('hex');
      doc.iteration_name = 'testiterationname-' + crypto.randomBytes(5).toString('hex');
      var currentDate = moment().format('MM/DD/YYYY');
      doc.iteration_start_dt = currentDate;
      doc.iteration_end_dt = currentDate;
      doc.client_sat = '';
      doc.team_sat = '';
      doc.nbr_stories_dlvrd = '0';
      doc.nbr_dplymnts = '0';
      doc.nbr_defects = '0';
      doc.nbr_cycletime_WIP = '';
      doc.nbr_cycletime_in_backlog = '';
      doc.team_id = validId;
      iterationModel.add(doc, user)
        .then(function(result) {
          expect(result).to.be.a('object');
          expect(result).to.have.property('id');
          expect(result.ok).to.be.equal(true);
          done();
        })
        .catch(function(err) {
          done();
        });
    });

    it('Saved iteration doc with some values', function(done) {
      var doc = _.clone(iterationDocValid_sample3);
      doc._id = 'testmyid-' + crypto.randomBytes(20).toString('hex');
      doc.iteration_name = 'testiterationname-' + crypto.randomBytes(5).toString('hex');
      var currentDate = moment().format('MM/DD/YYYY');
      doc.iteration_start_dt = currentDate;
      doc.iteration_end_dt = currentDate;
      doc.team_id = validId;
      iterationModel.add(doc, user)
        .then(function(result) {
          expect(result).to.be.a('object');
          expect(result).to.have.property('id');
          expect(result.ok).to.be.equal(true);
          done();
        })
        .catch(function(err) {
          done();
        });
    });

    it('Saved iteration doc with some values', function(done) {
      var doc = _.clone(iterationDocValid_sample3);
      doc._id = 'testmyid-' + crypto.randomBytes(20).toString('hex');
      doc.iteration_name = 'testiterationname-' + crypto.randomBytes(5).toString('hex');
      var currentDate = moment().format('MM/DD/YYYY');
      doc.iteration_start_dt = currentDate;
      doc.iteration_end_dt = currentDate;
      doc.team_id = validId;
      iterationModel.add(doc, user)
        .then(function(result) {
          expect(result).to.be.a('object');
          expect(result).to.have.property('id');
          expect(result.ok).to.be.equal(true);
          done();
        })
        .catch(function(err) {
          done();
        });
    });

    it('set status to Not complete', function(done) {
      var doc = _.clone(iterationDocValid_sample3);
      doc._id = 'testmyid-' + crypto.randomBytes(20).toString('hex');
      doc.iteration_name = 'testiterationname-' + crypto.randomBytes(5).toString('hex');
      var startdt = moment().format('MM/DD/YYYY');
      var enddt = moment().add(14, 'days').format('MM/DD/YYYY');
      doc.iteration_start_dt = startdt;
      doc.iteration_end_dt = enddt;
      doc.team_id = validId;
      iterationModel.add(doc, user)
        .then(function(result) {
          expect(result).to.be.a('object');
          expect(result).to.have.property('id');
          expect(result.ok).to.be.equal(true);
          done();
        })
        .catch(function(err) {
          done();
        });
    });
  });

  describe('[getByIterInfo]: Get iteration document', function() {
    this.timeout(timeout);
    it('Get all team iteration documents', function(done) {
      iterationModel.getByIterInfo(null)
        .then(function(result) {
          expect(result).to.be.a('object');
          expect(result).to.have.property('rows');
          done();
        })
        .catch(function(err) {
          done();
        });
    });

    it('Get team iteration docs by key', function(done) {
      iterationModel.getByIterInfo(validId)
        .then(function(result) {
          expect(result).to.be.a('object');
          expect(result).to.have.property('rows');
          expect(result.rows.length).to.not.equal(0);
          expect(result.rows[0]).to.have.property('value');
          expect(result.rows[0].value).to.have.property('team_id');
          expect(result.rows[0].value.team_id).to.be.equal(validTeamId);
          done();
        })
        .catch(function(err) {
          done();
        });
    });

    it('Get non-existent team iteration document', function(done) {
      var team_id = '1111111111111111';
      iterationModel.getByIterInfo(team_id)
        .then(function(result) {
          expect(result).to.be.a('object');
          expect(result).to.have.property('total_rows');
          expect(result).to.have.property('offset');
          expect(result).to.have.property('rows');
          expect(result.rows.length).to.be.equal(0);
          done();
        })
        .catch(function(err) {
          done();
        });
    });
  });

  describe('[get]: Get specific iteration document', function() {
    this.timeout(timeout);
    before(function(done) {
      this.timeout(10000);
      iterationModel.getByIterInfo(validId)
        .then(function(result) {
          if (result.rows.length == 0) {
            iterationDocValid.team_id = validId;
            return iterationModel.add(iterationDocValid, user);
          }
          else {
            return result;
          }
        })
        .then(function(result) {
          if (result && result.id) {
            iterationId = result.id;
            // console.log('\nSpecific doc iterationId 1:',iterationId, '\n');
            expect(result).to.be.a('object');
            expect(result).to.have.property('id');
            expect(result.ok).to.be.equal(true);
            done();
          }
          else {
            iterationId = result.rows[0].id;
            // console.log('\nSpecific doc iterationId 2:',iterationId, '\n');
            done();
          }
        })
        .catch(function(err) {
          expect(err).to.not.equal(null);
        });
    });

    it('Get a specific team iteration document', function(done) {
      iterationModel.get(iterationId)
        .then(function(result) {
          expect(result).to.be.a('object');
          expect(result).to.have.property('_id');
          expect(result).to.have.property('iteration_name');
          expect(result).to.have.property('team_id');
          done();
        })
        .catch(function(err) {
          done();
        });
    });
  });

  describe('[getCompletedIterationsByKey]: Get completed iteration', function() {
    this.timeout(timeout);
    it('Get completed iteration documents', function(done) {
      var startkey = undefined;
      var endkey = undefined;

      iterationModel.getCompletedIterationsByKey(startkey, endkey)
        .then(function(result) {
          expect(result).to.be.a('object');
          done();
        })
        .catch(function(err) {
          done();
        });
    });
  });

  describe('[edit]: Edit team iteration document', function() {
    this.timeout(timeout);
    before(function(done) {
      this.timeout(10000);
      var teamName = 'testteamid_1';
      var iterId = 'testmyid';
      iterationModel.getByIterInfo(validId)
        .then(function(result) {
          if (result.rows.length == 0) {
            iterationDocValid.team_id = validId;
            return iterationModel.add(iterationDocValid, user);
          }
          else {
            iterationId = result.rows[0].id;
            iterationName = result.rows[0].value.iteration_name;
            // console.log('\nEdit team iteration doc id1:',iterationId, '\n');
          }
        })
        .then(function(result) {
          if (result && result.id != undefined) {
            iterationId = result.id;
            // console.log('\nEdit team iteration doc id2:',iterationId, '\n');
            iterationName = result.iteration_name;
            expect(result).to.be.a('object');
            expect(result).to.have.property('id');
            expect(result.ok).to.be.equal(true);
          }
        })
        .catch(function(err){
          expect(err).to.not.equal(null);
        })
        .finally(function() {
          return iterationModel.get(iterId);
        })
        .then(function(result) {
        })
        .catch(function(err) {
          iterationDoc_duplicateIterName.team_id = validId;
          return iterationModel.add(iterationDoc_duplicateIterName, user);
        })
        .then(function(result) {
        })
        .catch(function(err) {
        })
        .finally(function() {
          done();
        });
    });

    it('It will successfully update iteration document with same iteration name', function(done) {
      iterationDocValid.iteration_name = iterationName;
      iterationDocValid.team_id = validId;
      iterationModel.edit(iterationId, iterationDocValid, user)
        .then(function(result) {
          iterationRev = result.rev;
          expect(result).to.be.a('object');
          expect(result).to.have.property('id');
          expect(result.ok).to.be.equal(true);
          done();
        })
        .catch(function(err) {
          done();
        });
    });

    it('It will successfully update iteration document', function(done) {
      iterationDocValid_sample2.team_id = validId;
      iterationModel.edit(iterationId, iterationDocValid_sample2, user)
        .then(function(result) {
          iterationRev = result.rev;
          expect(result).to.be.a('object');
          expect(result).to.have.property('id');
          expect(result.ok).to.be.equal(true);
          done();
        })
        .catch(function(err) {
          done();
        });
    });

    it('It will fail to update iteration document', function(done) {
      iterationDocInvalid.team_id = validId;
      iterationModel.edit(iterationId, iterationDocInvalid, user)
        .catch(function(err) {
          expect(err).to.be.a('object');
          expect(err).to.have.property('error');
          expect(err).to.not.equal(null);
          done();
        })
        .catch(function(err) {
          done();
        });
    });

    it('It will successfully updated document with New iteration name', function(done) {
      iterationDocValid.iteration_name = 'newiterationname-' + new Date().getTime();
      iterationDocValid.team_id = validId;
      iterationModel.edit(iterationId, iterationDocValid, user)
        .then(function(result) {
          iterationRev = result.rev;
          expect(result).to.be.a('object');
          expect(result).to.have.property('id');
          expect(result.ok).to.be.equal(true);
          done();
        })
        .catch(function(err) {
          done();
        });
    });

    it('Should return missing', function(done) {
      var id = '111111';
      iterationDocValid.iteration_name = 'newiterationname';
      iterationDocValid.team_id = validId;
      iterationModel.edit(id, iterationDocValid, user)
        .catch(function(err) {
          expect(err).to.not.equal(null);
          // expect(err).to.have.property('error');
          // expect(err.error).to.equal('missing');
          done();
        });
    });
  });

  describe('[edit]: Edit an existing iteration doc', function() {
    this.timeout(timeout);
    before(function(done) {
      iterationDocValid_sample3.team_id = validId;
      iterationModel.add(iterationDocValid_sample3, user)
        .then(function(result) {
          expect(result).to.be.a('object');
          expect(result).to.have.property('id');
          expect(result.ok).to.be.equal(true);
          done();
        })
        .catch(function(err) {
          done();
        });
    });

    it('Return Iteration no/identifier already exists', function(done) {
      iterationDocValid_sample3.team_id = validId;
      iterationModel.edit(iterationId, iterationDocValid_sample3, user)
        .catch(function(err) {
          expect(err).to.not.equal(null);
          expect(err.error).to.have.property('iteration_name');
          expect(err.error['iteration_name']).to.not.empty;
          expect(err.error['iteration_name'][0]).to.contain('exists');
          done();
        });
    });
  });

  describe('[delete]: Delete team iteration document', function() {
    this.timeout(timeout);
    var tmpIterationId;
    before(function(done) {
      var doc = _.clone(iterationDocValid_sample3);
      doc._id = 'testmyid-' + crypto.randomBytes(20).toString('hex');
      doc.iteration_name = 'testiterationname-' + crypto.randomBytes(5).toString('hex');
      var currentDate = moment().format('MM/DD/YYYY');
      doc.iteration_start_dt = currentDate;
      doc.iteration_end_dt = currentDate;
      doc.client_sat = '';
      doc.team_sat = '';
      doc.nbr_stories_dlvrd = '';
      doc.team_id = validId;
      iterationModel.add(doc, user)
        .then(function(result) {
          tmpIterationId = result.id;
          expect(result).to.be.a('object');
          expect(result).to.have.property('id');
          expect(result.ok).to.be.equal(true);
          done();
        })
        .catch(function(err) {
          done();
        });
    });

    it('Delete successfully a specific iteration doc', function(done) {
      iterationModel.get(tmpIterationId)
        .then(function(body) {
          var id = body._id;
          var rev = body._rev;
          return iterationModel.delete(id, rev);
        })
        .then(function(res) {
          done();
        })
        .catch(function(err) {
          done();
        });
    });

    it('Should return _id/_rev is missing', function(done) {
      iterationModel.delete()
        .catch(function(err) {
          expect(err).to.not.equal(null);
          expect(err).to.have.property('error');
          expect(err.error).to.have.property('_id');
          expect(err.error._id[0]).to.be.equal('_id/_rev is missing');
          done();
        });
    });
  });
});
