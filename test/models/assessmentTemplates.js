var chai = require('chai');
var expect = chai.expect;
var Promise = require('bluebird');
var validTemplates = require('./testData/validTemplates');
var assessmentTemplates = require('../../models/assessmentTemplates');
var mongoose = require('mongoose');
var _ = require('underscore');
var Schema = mongoose.Schema;
var deleteId = Schema.Types.ObjectId;

var testData = {
  initTemplate : function() {
    return {
      cloudantId : 'cloudant_id_for_assessment_template',
      version : 1,
      effectiveDate : new Date(),
      status : 'inactive'
    };
  },
  noComponents: function() {
    var template = this.initTemplate();
    template['components'] = [];
    return template;
  },
  invalidComponents: function() {
    var template = this.initTemplate();
    template['components'] = [{
      name: '',
      principles: [],

    }];
    return template;
  },
  invalidComponentsPrinciple: function() {
    var template = this.initTemplate();
    template['components'] = [{
      name: 'Component name',
      principles: [{
        id: '',
        name: '',
        practices: []
      }],
    }];
    return template;
  },
  validTemplates: function(){
    return validTemplates;
  }
};

describe('Assessment Template model [create]', function() {
  before(function(done){
    var promiseArray = [];
    promiseArray.push(assessmentTemplates.deleteByCloudantId(testData.initTemplate().cloudantId));
    promiseArray.push(assessmentTemplates.deleteByCloudantId(testData.validTemplates().cloudantId));
    promiseArray.push(assessmentTemplates.deleteByCloudantId('cloudant_id_inactive'));
    promiseArray.push(assessmentTemplates.deleteByCloudantId('cloudant_id_active'));
    Promise.all(promiseArray)
      .then(function(results){
        done();
      })
      .catch(function(err){
        done();
      });
  });
  it('will fail because assessment template data is required', function(done){
    assessmentTemplates.create()
      .catch(function(err) {
        expect(err.error).to.be.equal('Assessment template data is required');
        done();
      });
  });

  it('will fail because assessment template components is required', function(done){
    assessmentTemplates.create(testData.noComponents())
      .catch(function(err) {
        expect(err).to.be.have.property('errors');
        done();
      });
  });

  it('will fail because assessment template components is invalid', function(done){
    assessmentTemplates.create(testData.invalidComponents())
      .catch(function(err) {
        expect(err).to.be.have.property('errors');
        done();
      });
  });

  it('will fail because assessment template components principles is invalid', function(done){
    assessmentTemplates.create(testData.invalidComponentsPrinciple())
      .catch(function(err) {
        expect(err).to.be.have.property('errors');
        done();
      });
  });

  it('will return success in creating a new assessment template', function(done){
    assessmentTemplates.create(testData.validTemplates())
      .then(function(result) {
        expect(result).to.have.property('_id');
        var tId = result['_id'];
        return assessmentTemplates.delete(tId);
      })
      .then(function(result) {
        expect(result.result.ok).to.be.equal(1);
        expect(result.result.n).to.be.equal(1);
        done();
      });
  });

});

describe('Assessment Template model [get]', function() {
  it('will return for invalid assessment id', function(done) {
    assessmentTemplates.get('invalid-template-id', null)
      .catch(function(err) {
        expect(err.value).to.be.equal('invalid-template-id');
        done();
      });
  });

  it('will return empty for none existing assessment status', function(done) {
    assessmentTemplates.get(null, 'none-existing-status')
      .then(function(result) {
        expect(result).to.be.empty;
        done();
      });
  });

  it('will return assessment template', function(done){
    var activeTemplate = testData.validTemplates();
    activeTemplate['status'] = 'active';
    assessmentTemplates.create(activeTemplate)
      .then(function(result) {
        return assessmentTemplates.get(result['_id'], null);
      })
      .then(function(result) {
        expect(result['status']).to.be.equal('active');
        var tId = result['_id'];
        return assessmentTemplates.delete(tId);
      })
      .then(function(result) {
        expect(result.result.ok).to.be.equal(1);
        expect(result.result.n).to.be.equal(1);
        done();
      });
  });

  it('will return active assessment template', function(done){
    var activeTemplate = testData.validTemplates();
    activeTemplate['status'] = 'active';
    assessmentTemplates.create(activeTemplate)
      .then(function(result) {
        expect(result).to.have.property('_id');
        expect(result).to.have.property('status');
        expect(result.status).to.be.equal('active');
        deleteId = result['_id'];
        return assessmentTemplates.get(null, 'active');
      })
      .then(function(result) {
        expect(result).to.be.a('array');
        tAssess = _.find(result, function(assessment){
          if (assessment._id.toString() == deleteId.toString()) {
            return assessment;
          }
        });
        expect(tAssess['status']).to.be.equal('active');
        return assessmentTemplates.delete(tAssess['_id']);
      })
      .then(function(result) {
        expect(result.result.ok).to.be.equal(1);
        expect(result.result.n).to.be.equal(1);
        done();
      });
  });

  it('will return inactive assessment template', function(done){
    var activeTemplate = testData.validTemplates();
    activeTemplate['status'] = 'inactive';
    assessmentTemplates.create(activeTemplate)
      .then(function(result) {
        expect(result).to.have.property('_id');
        expect(result).to.have.property('status');
        expect(result.status).to.be.equal('inactive');
        deleteId = result['_id'];
        return assessmentTemplates.get(null, 'inactive');
      })
      .then(function(result) {
        expect(result).to.be.a('array');
        tAssess = _.find(result, function(assessment){
          if (assessment._id.toString() == deleteId.toString()) {
            return assessment;
          }
        });
        expect(tAssess['status']).to.be.equal('inactive');
        return assessmentTemplates.delete(tAssess['_id']);
      })
      .then(function(result) {
        expect(result.result.ok).to.be.equal(1);
        expect(result.result.n).to.be.equal(1);
        done();
      });
  });

  it('will return active and inactive assessment template', function(done) {
    var inactiveTemplate = testData.validTemplates();
    inactiveTemplate['cloudantId'] = 'cloudant_id_inactive';
    inactiveTemplate['status'] = 'inactive';
    assessmentTemplates.create(inactiveTemplate)
      .then(function() {
        var activeTemplate = testData.validTemplates();
        activeTemplate['cloudantId'] = 'cloudant_id_active';
        activeTemplate['status'] = 'active';
        return assessmentTemplates.create(activeTemplate);
      })
      .then(function() {
        return assessmentTemplates.get(null, null);
      })
      .then(function(result) {
        expect(result).to.be.a('array');
        var deleteTpl = [assessmentTemplates.deleteByCloudantId('cloudant_id_active'), assessmentTemplates.deleteByCloudantId('cloudant_id_inactive')];
        return Promise.all(deleteTpl);
      })
      .then(function() {
        done();
      });
  });
});

describe('Assessment Template model [getTemplateByVersion]', function() {
  it('will return false with empty version number', function(done){
    assessmentTemplates.getTemplateByVersion()
      .catch(function(err){
        expect(err).to.be.a('object');
        expect(err.error).to.equal('Version number cannot be empty.');
        done();
      });
  });
  it('will return template with the version number', function(done){
    var activeTemplate = testData.validTemplates();
    assessmentTemplates.create(activeTemplate)
      .then(function(result){
        return assessmentTemplates.getTemplateByVersion(activeTemplate.cloudantId);
      })
      .then(function(result){
        expect(result).to.be.a('object');
        expect(result.cloudantId).to.equal(activeTemplate.cloudantId);
        return assessmentTemplates.delete(result._id);
      })
      .then(function(){
        done();
      });
  });
});

describe('Assessment Template model [update]', function() {
  it('return fail because template ID is required', function(done) {
    assessmentTemplates.update(null)
      .catch(function(err) {
        expect(err.error).to.be.equal('Assessment template id is required');
        done();
      });
  });

  it('return success in updating template', function(done) {
    var activeTemplate = testData.validTemplates();
    activeTemplate['cloudantId'] = 'cloudant_id_update';
    activeTemplate['status'] = 'active';
    assessmentTemplates.create(activeTemplate)
      .then(function(result) {
        var update = {'status':'inactive','cloudantId':'new_cloudant_id'};
        var id = result['_id'];
        return assessmentTemplates.update(id, update);
      })
      .then(function(updated) {
        expect(updated['status']).to.be.equal('inactive');
        expect(updated['cloudantId']).to.be.equal('new_cloudant_id');
        return assessmentTemplates.delete(updated['_id']);
      })
      .then(function(deleted) {
        expect(deleted.result.ok).to.be.equal(1);
        expect(deleted.result.n).to.be.equal(1);
        done();
      });
  });
});

describe('Assessment Template model [delete]', function() {
  it('return fail because template ID is required', function(done) {
    assessmentTemplates.delete(null)
      .catch(function(err) {
        expect(err.error).to.be.equal('Assessment template id is required');
        done();
      });
  });

  it('return success in deleting template', function(done) {
    var activeTemplate = testData.validTemplates();
    assessmentTemplates.create(activeTemplate)
      .then(function(result) {
        return assessmentTemplates.delete(result['_id']);
      })
      .then(function(result) {
        expect(result.result.ok).to.be.equal(1);
        expect(result.result.n).to.be.equal(1);
        done();
      });
  });
});
