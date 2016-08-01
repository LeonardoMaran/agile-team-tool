var chai = require('chai');

var expect = chai.expect;
var Promise = require('bluebird');
var assessmentModel = require('../../models/assessment');
var teamModel = require('../../models/teams');
var dummyData = require('../dummy-data.js');
var _ = require('underscore');
var others = require('../../models/others');
var common = require('../../models/common-cloudant');
var timeout = 30000;
var currRevisionId = '';
var invalidTeamId ='team_12323';
var invalidAssessId ='assess_test';
var invalidRevisionId = '12-*219#';
var noId = {"type":"matassessmtrslt","team_id":"ag_team_JMTestTeam_1469457533966","assessmt_version":"ag_ref_atma_components_v06","team_proj_ops":"Project","team_dlvr_software":"Yes","assessmt_status":"Submitted","submitter_id":"mondigjd@ph.ibm.com","self-assessmt_dt":"2016-07-11 00:00:01 EDT","ind_assessor_id":"","ind_assessmt_status":"","ind_assessmt_dt":"","created_dt":"2016-07-19 17:47:28 SGT","created_user":"mondigjd@ph.ibm.com","last_updt_dt":"2016-07-19 17:47:28 SGT","last_updt_user":"mondigjd@ph.ibm.com","doc_status":"","assessmt_cmpnt_rslts":[{"assessed_cmpnt_name":"Team Agile Leadership and Collaboration - Projects","assessed_cmpnt_tbl":[{"principle_id":"1","principle_name":"Collaboration and Teamwork","practice_id":"1","practice_name":"Standups","cur_mat_lvl_achieved":"Practicing","cur_mat_lvl_score":2,"tar_mat_lvl_achieved":"Transforming","tar_mat_lvl_score":3,"ind_mat_lvl_achieved":"","ind_target_mat_lvl_score":0,"how_better_action_item":"","ind_assessor_cmnt":""},{"principle_id":"1","principle_name":"Collaboration and Teamwork","practice_id":"2","practice_name":"Walls of Work","cur_mat_lvl_achieved":"Practicing","cur_mat_lvl_score":2,"tar_mat_lvl_achieved":"Transforming","tar_mat_lvl_score":3,"ind_mat_lvl_achieved":"","ind_target_mat_lvl_score":0,"how_better_action_item":"","ind_assessor_cmnt":""},{"principle_id":"2","principle_name":"Focus on the Customer and Business Value","practice_id":"3","practice_name":"Engaging the Product Owner","cur_mat_lvl_achieved":"Transforming","cur_mat_lvl_score":3,"tar_mat_lvl_achieved":"Scaling","tar_mat_lvl_score":4,"ind_mat_lvl_achieved":"","ind_target_mat_lvl_score":0,"how_better_action_item":"","ind_assessor_cmnt":""},{"principle_id":"2","principle_name":"Focus on the Customer and Business Value","practice_id":"4","practice_name":"Backlog Refinement","cur_mat_lvl_achieved":"Practicing","cur_mat_lvl_score":2,"tar_mat_lvl_achieved":"Transforming","tar_mat_lvl_score":3,"ind_mat_lvl_achieved":"","ind_target_mat_lvl_score":0,"how_better_action_item":"","ind_assessor_cmnt":""},{"principle_id":"3","principle_name":"Flexible, Adaptive and Continuously Improving","practice_id":"5","practice_name":"Release and Iteration Planning","cur_mat_lvl_achieved":"Transforming","cur_mat_lvl_score":3,"tar_mat_lvl_achieved":"Scaling","tar_mat_lvl_score":4,"ind_mat_lvl_achieved":"","ind_target_mat_lvl_score":0,"how_better_action_item":"","ind_assessor_cmnt":""},{"principle_id":"3","principle_name":"Flexible, Adaptive and Continuously Improving","practice_id":"6","practice_name":"Retrospectives","cur_mat_lvl_achieved":"Practicing","cur_mat_lvl_score":2,"tar_mat_lvl_achieved":"Transforming","tar_mat_lvl_score":3,"ind_mat_lvl_achieved":"","ind_target_mat_lvl_score":0,"how_better_action_item":"","ind_assessor_cmnt":""},{"principle_id":"3","principle_name":"Flexible, Adaptive and Continuously Improving","practice_id":"7","practice_name":"Work Estimation (Relative Estimates)","cur_mat_lvl_achieved":"Practicing","cur_mat_lvl_score":2,"tar_mat_lvl_achieved":"Transforming","tar_mat_lvl_score":3,"ind_mat_lvl_achieved":"","ind_target_mat_lvl_score":0,"how_better_action_item":"","ind_assessor_cmnt":""},{"principle_id":"4","principle_name":"Iterative and Fast","practice_id":"8","practice_name":"Story Cards","cur_mat_lvl_achieved":"Practicing","cur_mat_lvl_score":2,"tar_mat_lvl_achieved":"Transforming","tar_mat_lvl_score":3,"ind_mat_lvl_achieved":"","ind_target_mat_lvl_score":0,"how_better_action_item":"","ind_assessor_cmnt":""},{"principle_id":"5","principle_name":"Empowered and Self Directed Teams","practice_id":"9","practice_name":"Stable Cross-Functional Teams","cur_mat_lvl_achieved":"Transforming","cur_mat_lvl_score":3,"tar_mat_lvl_achieved":"Scaling","tar_mat_lvl_score":4,"ind_mat_lvl_achieved":"","ind_target_mat_lvl_score":0,"how_better_action_item":"","ind_assessor_cmnt":""},{"principle_id":"5","principle_name":"Empowered and Self Directed Teams","practice_id":"10","practice_name":"Social Contract","cur_mat_lvl_achieved":"Practicing","cur_mat_lvl_score":2,"tar_mat_lvl_achieved":"Transforming","tar_mat_lvl_score":3,"ind_mat_lvl_achieved":"","ind_target_mat_lvl_score":0,"how_better_action_item":"","ind_assessor_cmnt":""},{"principle_id":"5","principle_name":"Empowered and Self Directed Teams","practice_id":"11","practice_name":"Risk and Issue Management","cur_mat_lvl_achieved":"Transforming","cur_mat_lvl_score":3,"tar_mat_lvl_achieved":"Scaling","tar_mat_lvl_score":4,"ind_mat_lvl_achieved":"","ind_target_mat_lvl_score":0,"how_better_action_item":"","ind_assessor_cmnt":""}],"ovralcur_assessmt_score":"2.4","ovraltar_assessmt_score":"3.4"},{"assessed_cmpnt_name":"Team Delivery","assessed_cmpnt_tbl":[{"principle_id":"1","principle_name":"Continuous Development","practice_id":"1","practice_name":"Automated builds & Continuous Integration","cur_mat_lvl_achieved":"Practicing","cur_mat_lvl_score":2,"tar_mat_lvl_achieved":"Transforming","tar_mat_lvl_score":3,"ind_mat_lvl_achieved":"","ind_target_mat_lvl_score":0,"how_better_action_item":"","ind_assessor_cmnt":""},{"principle_id":"1","principle_name":"Continuous Development","practice_id":"2","practice_name":"Managing Technical Debt","cur_mat_lvl_achieved":"Transforming","cur_mat_lvl_score":3,"tar_mat_lvl_achieved":"Scaling","tar_mat_lvl_score":4,"ind_mat_lvl_achieved":"","ind_target_mat_lvl_score":0,"how_better_action_item":"","ind_assessor_cmnt":""},{"principle_id":"1","principle_name":"Continuous Development","practice_id":"3","practice_name":"Dev & Ops Collaboration / Shared Understanding","cur_mat_lvl_achieved":"Transforming","cur_mat_lvl_score":3,"tar_mat_lvl_achieved":"Scaling","tar_mat_lvl_score":4,"ind_mat_lvl_achieved":"","ind_target_mat_lvl_score":0,"how_better_action_item":"","ind_assessor_cmnt":""},{"principle_id":"1","principle_name":"Continuous Development","practice_id":"4","practice_name":"Infrastructure Automation / Provisioning","cur_mat_lvl_achieved":"Initiating","cur_mat_lvl_score":1,"tar_mat_lvl_achieved":"Practicing","tar_mat_lvl_score":2,"ind_mat_lvl_achieved":"","ind_target_mat_lvl_score":0,"how_better_action_item":"","ind_assessor_cmnt":""},{"principle_id":"2","principle_name":"Continuous Testing","practice_id":"5","practice_name":"Automated Testing","cur_mat_lvl_achieved":"Practicing","cur_mat_lvl_score":2,"tar_mat_lvl_achieved":"Transforming","tar_mat_lvl_score":3,"ind_mat_lvl_achieved":"","ind_target_mat_lvl_score":0,"how_better_action_item":"","ind_assessor_cmnt":""},{"principle_id":"3","principle_name":"Continuous Release & Deployment","practice_id":"6","practice_name":"Automated Deployments","cur_mat_lvl_achieved":"Practicing","cur_mat_lvl_score":2,"tar_mat_lvl_achieved":"Transforming","tar_mat_lvl_score":3,"ind_mat_lvl_achieved":"","ind_target_mat_lvl_score":0,"how_better_action_item":"","ind_assessor_cmnt":""},{"principle_id":"4","principle_name":"Continuous Feedback & Optimization","practice_id":"7","practice_name":"Customer Feedback","cur_mat_lvl_achieved":"Practicing","cur_mat_lvl_score":2,"tar_mat_lvl_achieved":"Transforming","tar_mat_lvl_score":3,"ind_mat_lvl_achieved":"","ind_target_mat_lvl_score":0,"how_better_action_item":"","ind_assessor_cmnt":""},{"principle_id":"5","principle_name":"Continuous Monitoring","practice_id":"8","practice_name":"Monitoring of Environments","cur_mat_lvl_achieved":"Practicing","cur_mat_lvl_score":2,"tar_mat_lvl_achieved":"Transforming","tar_mat_lvl_score":3,"ind_mat_lvl_achieved":"","ind_target_mat_lvl_score":0,"how_better_action_item":"","ind_assessor_cmnt":""}],"ovralcur_assessmt_score":"2.1","ovraltar_assessmt_score":"3.1"}],"assessmt_action_plan_tbl":[
]};
var teamData = {name:'JM Test Team',desc:'JM Test Team',squadteam:'Yes'};
var curr_assessment = {'_id':'','type':'matassessmtrslt','team_id':'','assessmt_version':'ag_ref_atma_components_v06','team_proj_ops':'Project','team_dlvr_software':'Yes','assessmt_status':'Submitted','submitter_id':'mondigjd@ph.ibm.com','self-assessmt_dt':'2016-07-11 00:00:01 EDT','ind_assessor_id':'','ind_assessmt_status':'','ind_assessmt_dt':'','created_dt':'2016-07-19 17:47:28 SGT','created_user':'mondigjd@ph.ibm.com','last_updt_dt':'2016-07-19 17:47:28 SGT','last_updt_user':'mondigjd@ph.ibm.com','doc_status':'','assessmt_cmpnt_rslts':[{'assessed_cmpnt_name':'Team Agile Leadership and Collaboration - Projects','assessed_cmpnt_tbl':[{'principle_id':'1','principle_name':'Collaboration and Teamwork','practice_id':'1','practice_name':'Standups','cur_mat_lvl_achieved':'Practicing','cur_mat_lvl_score':3,'tar_mat_lvl_achieved':'Transforming','tar_mat_lvl_score':4,'ind_mat_lvl_achieved':'','ind_target_mat_lvl_score':0,'how_better_action_item':'','ind_assessor_cmnt':''},{'principle_id':'1','principle_name':'Collaboration and Teamwork','practice_id':'2','practice_name':'Walls of Work','cur_mat_lvl_achieved':'Practicing','cur_mat_lvl_score':2,'tar_mat_lvl_achieved':'Transforming','tar_mat_lvl_score':3,'ind_mat_lvl_achieved':'','ind_target_mat_lvl_score':0,'how_better_action_item':'','ind_assessor_cmnt':''},{'principle_id':'2','principle_name':'Focus on the Customer and Business Value','practice_id':'3','practice_name':'Engaging the Product Owner','cur_mat_lvl_achieved':'Transforming','cur_mat_lvl_score':3,'tar_mat_lvl_achieved':'Scaling','tar_mat_lvl_score':4,'ind_mat_lvl_achieved':'','ind_target_mat_lvl_score':0,'how_better_action_item':'','ind_assessor_cmnt':''},{'principle_id':'2','principle_name':'Focus on the Customer and Business Value','practice_id':'4','practice_name':'Backlog Refinement','cur_mat_lvl_achieved':'Practicing','cur_mat_lvl_score':2,'tar_mat_lvl_achieved':'Transforming','tar_mat_lvl_score':3,'ind_mat_lvl_achieved':'','ind_target_mat_lvl_score':0,'how_better_action_item':'','ind_assessor_cmnt':''},{'principle_id':'3','principle_name':'Flexible, Adaptive and Continuously Improving','practice_id':'5','practice_name':'Release and Iteration Planning','cur_mat_lvl_achieved':'Transforming','cur_mat_lvl_score':3,'tar_mat_lvl_achieved':'Scaling','tar_mat_lvl_score':4,'ind_mat_lvl_achieved':'','ind_target_mat_lvl_score':0,'how_better_action_item':'','ind_assessor_cmnt':''},{'principle_id':'3','principle_name':'Flexible, Adaptive and Continuously Improving','practice_id':'6','practice_name':'Retrospectives','cur_mat_lvl_achieved':'Practicing','cur_mat_lvl_score':2,'tar_mat_lvl_achieved':'Transforming','tar_mat_lvl_score':3,'ind_mat_lvl_achieved':'','ind_target_mat_lvl_score':0,'how_better_action_item':'','ind_assessor_cmnt':''},{'principle_id':'3','principle_name':'Flexible, Adaptive and Continuously Improving','practice_id':'7','practice_name':'Work Estimation (Relative Estimates)','cur_mat_lvl_achieved':'Practicing','cur_mat_lvl_score':2,'tar_mat_lvl_achieved':'Transforming','tar_mat_lvl_score':3,'ind_mat_lvl_achieved':'','ind_target_mat_lvl_score':0,'how_better_action_item':'','ind_assessor_cmnt':''},{'principle_id':'4','principle_name':'Iterative and Fast','practice_id':'8','practice_name':'Story Cards','cur_mat_lvl_achieved':'Practicing','cur_mat_lvl_score':2,'tar_mat_lvl_achieved':'Transforming','tar_mat_lvl_score':3,'ind_mat_lvl_achieved':'','ind_target_mat_lvl_score':0,'how_better_action_item':'','ind_assessor_cmnt':''},{'principle_id':'5','principle_name':'Empowered and Self Directed Teams','practice_id':'9','practice_name':'Stable Cross-Functional Teams','cur_mat_lvl_achieved':'Transforming','cur_mat_lvl_score':3,'tar_mat_lvl_achieved':'Scaling','tar_mat_lvl_score':4,'ind_mat_lvl_achieved':'','ind_target_mat_lvl_score':0,'how_better_action_item':'','ind_assessor_cmnt':''},{'principle_id':'5','principle_name':'Empowered and Self Directed Teams','practice_id':'10','practice_name':'Social Contract','cur_mat_lvl_achieved':'Practicing','cur_mat_lvl_score':2,'tar_mat_lvl_achieved':'Transforming','tar_mat_lvl_score':3,'ind_mat_lvl_achieved':'','ind_target_mat_lvl_score':0,'how_better_action_item':'','ind_assessor_cmnt':''},{'principle_id':'5','principle_name':'Empowered and Self Directed Teams','practice_id':'11','practice_name':'Risk and Issue Management','cur_mat_lvl_achieved':'Transforming','cur_mat_lvl_score':3,'tar_mat_lvl_achieved':'Scaling','tar_mat_lvl_score':4,'ind_mat_lvl_achieved':'','ind_target_mat_lvl_score':0,'how_better_action_item':'','ind_assessor_cmnt':''}],'ovralcur_assessmt_score':'2.4','ovraltar_assessmt_score':'3.4'},{'assessed_cmpnt_name':'Team Delivery','assessed_cmpnt_tbl':[{'principle_id':'1','principle_name':'Continuous Development','practice_id':'1','practice_name':'Automated builds & Continuous Integration','cur_mat_lvl_achieved':'Practicing','cur_mat_lvl_score':2,'tar_mat_lvl_achieved':'Transforming','tar_mat_lvl_score':3,'ind_mat_lvl_achieved':'','ind_target_mat_lvl_score':0,'how_better_action_item':'','ind_assessor_cmnt':''},{'principle_id':'1','principle_name':'Continuous Development','practice_id':'2','practice_name':'Managing Technical Debt','cur_mat_lvl_achieved':'Transforming','cur_mat_lvl_score':3,'tar_mat_lvl_achieved':'Scaling','tar_mat_lvl_score':4,'ind_mat_lvl_achieved':'','ind_target_mat_lvl_score':0,'how_better_action_item':'','ind_assessor_cmnt':''},{'principle_id':'1','principle_name':'Continuous Development','practice_id':'3','practice_name':'Dev & Ops Collaboration / Shared Understanding','cur_mat_lvl_achieved':'Transforming','cur_mat_lvl_score':3,'tar_mat_lvl_achieved':'Scaling','tar_mat_lvl_score':4,'ind_mat_lvl_achieved':'','ind_target_mat_lvl_score':0,'how_better_action_item':'','ind_assessor_cmnt':''},{'principle_id':'1','principle_name':'Continuous Development','practice_id':'4','practice_name':'Infrastructure Automation / Provisioning','cur_mat_lvl_achieved':'Initiating','cur_mat_lvl_score':1,'tar_mat_lvl_achieved':'Practicing','tar_mat_lvl_score':2,'ind_mat_lvl_achieved':'','ind_target_mat_lvl_score':0,'how_better_action_item':'','ind_assessor_cmnt':''},{'principle_id':'2','principle_name':'Continuous Testing','practice_id':'5','practice_name':'Automated Testing','cur_mat_lvl_achieved':'Practicing','cur_mat_lvl_score':2,'tar_mat_lvl_achieved':'Transforming','tar_mat_lvl_score':3,'ind_mat_lvl_achieved':'','ind_target_mat_lvl_score':0,'how_better_action_item':'','ind_assessor_cmnt':''},{'principle_id':'3','principle_name':'Continuous Release & Deployment','practice_id':'6','practice_name':'Automated Deployments','cur_mat_lvl_achieved':'Practicing','cur_mat_lvl_score':2,'tar_mat_lvl_achieved':'Transforming','tar_mat_lvl_score':3,'ind_mat_lvl_achieved':'','ind_target_mat_lvl_score':0,'how_better_action_item':'','ind_assessor_cmnt':''},{'principle_id':'4','principle_name':'Continuous Feedback & Optimization','practice_id':'7','practice_name':'Customer Feedback','cur_mat_lvl_achieved':'Practicing','cur_mat_lvl_score':2,'tar_mat_lvl_achieved':'Transforming','tar_mat_lvl_score':3,'ind_mat_lvl_achieved':'','ind_target_mat_lvl_score':0,'how_better_action_item':'','ind_assessor_cmnt':''},{'principle_id':'5','principle_name':'Continuous Monitoring','practice_id':'8','practice_name':'Monitoring of Environments','cur_mat_lvl_achieved':'Practicing','cur_mat_lvl_score':2,'tar_mat_lvl_achieved':'Transforming','tar_mat_lvl_score':3,'ind_mat_lvl_achieved':'','ind_target_mat_lvl_score':0,'how_better_action_item':'','ind_assessor_cmnt':''}],'ovralcur_assessmt_score':'2.1','ovraltar_assessmt_score':'3.1'}],'assessmt_action_plan_tbl':[]};

var parentTeamId = 'ag_team_JMParentTestTeam_1469853919284';
var childTeamId = 'ag_team_JMTestTeam_1469457533966';
var parentTeamData = {name:'JM Parent Test Team',desc:'JM Parent Test Team',squadteam:'No'};
var parentUser = {'shortEmail': 'jazz.ma@ph.ibm.com','ldap':{'serialNumber': '153456PH1','hrFirstName': 'Jazz','hrLastName': 'Ma'}};
var adminList;

describe('Assessment Model', function() {
before(function(done){
  this.timeout(timeout);
  var teamId;
   others.getAdmins('ag_ref_access_control')
    .then(function(body){
      adminList = body.ACL_Full_Admin;
      return teamModel.getName(parentTeamData.name);
    })
    .then(function(body){
      if (_.isEmpty(body)){
        parentTeamData = teamModel.defaultTeamDoc(parentTeamData, parentUser);
        parentTeamData._id = parentTeamId;
        parentTeamData.child_team_id = [childTeamId];
        return common.addRecord(parentTeamData);
      }
      else{
        return body;
      }
    })
    .then(function(body){
      if (Array.isArray(body)){
        parentTeamId  = body[0].id;
      }
      else{
        parentTeamId = body.id;
      }
      return teamModel.getName(teamData.name)
    })
    .then(function(body){
      if (_.isEmpty(body)){
        teamData = teamModel.defaultTeamDoc(teamData, dummyData.user.details);
        teamData._id = childTeamId;
        teamData.parent_team_id = parentTeamId;
        return common.addRecord(teamData);
      }
      else{
        return body;
      }
    })
    .then(function(body){
      if (Array.isArray(body)){
        teamId  = body[0].id;
      }
      else{
        teamId = body.id;
      }
      //set current team id for assessment
      curr_assessment.team_id = teamId;
      curr_assessment._id = 'ag_mar_'+teamId+'_1469112933083';
      return assessmentModel.getAssessment(curr_assessment._id);
    })
    .then(function(body){
      return assessmentModel.deleteAssessment(dummyData.user.details.shortEmail, body._id, body._rev)
    })
    .catch(function(err){
      console.log('record error >> ',err.error);
    })
    .finally(function(){
      console.log('Team data preparation done. '+curr_assessment._id+' for team '+curr_assessment.team_id+' parentTeamId: '+parentTeamId);
      done();
    });
});

describe("assessment models [getAssessmentTemplate]", function(){
  this.timeout(timeout);
  it("retrieve assessment template", function(done){
    assessmentModel.getAssessmentTemplate()
      .then(function(body){
        expect(body).to.be.a('object');
        expect(body).to.have.property('rows');
      })
      .catch(function(err){
        expect(err.error).to.be.equal('undefined');
      })
      .finally(function(){
        done();
      });
  });
});

describe("assessment models [validate user]", function(){
  this.timeout(timeout);
  it("user is member of selected team", function(done){
    assessmentModel.userValidation(dummyData.user.details.shortEmail,curr_assessment.team_id)
      .then(function(body){
        expect(body).to.equal(true);
        console.log('User '+dummyData.user.details.shortEmail+' allowed.');
      })
      .catch(function(err){
        expect(err.error).to.equal('Unauthorized user.');
      })
      .finally(function(){
        done();
      });
  });

  it("parent team user", function(done){
    assessmentModel.userValidation(parentUser.shortEmail,curr_assessment.team_id)
      .then(function(body){
        expect(body).to.equal(true);
        console.log('User '+parentUser.shortEmail+' is allowed.');
      })
      .catch(function(err){
        expect(err.error).to.equal('Unauthorized user.');
      })
      .finally(function(){
        done();
      });
  });

  it("admin user", function(done){
    assessmentModel.userValidation(adminList[0],curr_assessment.team_id)
      .then(function(body){
        expect(body).to.equal(true);
        console.log(adminList[0] +' is allowed.');
      })
      .catch(function(err){
        expect(err.error).to.equal('Unauthorized user.');
      })
      .finally(function(){
        done();
      });
  });

  it("not team member user", function(done){
    assessmentModel.userValidation('test.user@ph.ibm.com',curr_assessment.team_id)
      .then(function(body){
        expect(body).to.equal(false);
      })
      .catch(function(err){
        expect(err.error).to.equal('Unauthorized user.');
      })
      .finally(function(){
        done();
      });
  });
});

describe("assessment models [document validation]", function(){
  this.timeout(timeout);
  var valAssessment;

  it("draft assessment with no created date", function(done){
    valAssessment = _.clone(curr_assessment);
    valAssessment.assessmt_status = 'Draft';
    valAssessment.assessmt_cmpnt_rslts[0].assessed_cmpnt_tbl[0].cur_mat_lvl_score = '';
    valAssessment.created_dt = '';
    assessmentModel.addTeamAssessment(dummyData.user.details.shortEmail, valAssessment)
      .then(function(body){
        expect(body).to.be.equal(null);
      })
      .catch(function(err){
        expect(err.error.created_dt[0]).to.equal('Created date is required.');
      })
      .finally(function(){
        done();
      });
  });

  
  it("valid draft assessment", function(done){
    valAssessment.created_dt = others.getServerTime();
    assessmentModel.addTeamAssessment(dummyData.user.details.shortEmail, valAssessment)
      .then(function(body){
        expect(body.ok).to.be.true;
        expect(body.id).to.be.equal(valAssessment._id);
        currRevisionId = body.rev;
      })
      .catch(function(err){
        expect(err.error).to.be.equal('undefined');
      })
      .finally(function(){
        done();
      });
  });

  it("draft assessment for update", function(done){
    var draftForUpdate = _.clone(valAssessment);
    draftForUpdate._rev = currRevisionId;
    assessmentModel.updateTeamAssessment(dummyData.user.details.shortEmail, draftForUpdate)
      .then(function(body){
        expect(body.ok).to.be.true;
        expect(body.id).to.be.equal(draftForUpdate._id);
        currRevisionId = body.rev;
      })
      .catch(function(err){
        expect(err.error).to.be.equal('undefined');
      })
      .finally(function(){
        done();
      });
  });
  
  it("new submitted assessment (unaswered question)", function(done){
    valAssessment.assessmt_status = 'Submitted';
    assessmentModel.addTeamAssessment(dummyData.user.details.shortEmail, valAssessment)
      .then(function(body){
        expect(body).to.be.equal(null);
      })
      .catch(function(err){
        expect(err.error.cur_mat_lvl_score[0]).to.equal('All assessment maturity practices need to be answered.  See highlighted practices in yellow.');
      })
      .finally(function(){        
        done();
      });
  });

  it("update assessment (unaswered question)", function(done){
    assessmentModel.updateTeamAssessment(dummyData.user.details.shortEmail, valAssessment)
      .then(function(body){
        expect(body).to.be.equal(null);
      })
      .catch(function(err){
        expect(err.error.cur_mat_lvl_score[0]).to.equal('All assessment maturity practices need to be answered.  See highlighted practices in yellow.');
      })
      .finally(function(){
        done();
      });
  });

  
  it("new submitted assessment (invalid project type)", function(done){
    valAssessment.assessmt_cmpnt_rslts[0].assessed_cmpnt_tbl[0].cur_mat_lvl_score = 2;
    valAssessment.team_proj_ops = 'General';
    assessmentModel.addTeamAssessment(dummyData.user.details.shortEmail, valAssessment)
      .then(function(body){
        expect(body).to.be.equal(null);
      })
      .catch(function(err){
        expect(err.error.team_proj_ops[0]).to.equal('General is not included in the list');
      })
      .finally(function(){
        done();
      });
  });

  it("new submitted assessment (no overall assessment score)", function(done){
    valAssessment.team_proj_ops = 'Project';
    valAssessment.assessmt_cmpnt_rslts[0].assessed_cmpnt_tbl[0].cur_mat_lvl_score = 2;
    valAssessment.assessmt_cmpnt_rslts[0].ovraltar_assessmt_score = '';
    assessmentModel.addTeamAssessment(dummyData.user.details.shortEmail, valAssessment)
      .then(function(body){
        expect(body).to.be.equal(null);
      })
      .catch(function(err){
        expect(err.error.ovraltar_assessmt_score[0]).to.equal('Overall target assessment score is required.');
      })
      .finally(function(){
        done();
      });
  });

  
  it("new submitted assessment (incomplete action plan field)", function(done){
    valAssessment.team_id = curr_assessment.team_id;
    valAssessment.assessmt_cmpnt_rslts[0].ovraltar_assessmt_score = 3.4;
    valAssessment.assessmt_cmpnt_rslts[0] = curr_assessment.assessmt_cmpnt_rslts[0];
    var action = new Object();
    action.action_plan_entry_id = 0;
    action.user_created = 'No';
    action.assessmt_cmpnt_name = 'Team Agile Leadership and Collaboration - Operations';
    action.principle_id = '';
    action.principle_name = 'Focus on the Customer and Business Value';
    action.practice_id = 3;
    action.practice_name = 'Value Stream Mapping';
    action.how_better_action_item = 'Test data only';
    action.cur_mat_lvl_score = 2;
    action.tar_mat_lvl_score = 3;
    action.progress_summ = '';
    action.key_metric = '';
    action.review_dt = '';
    action.action_item_status = 'Open';
    valAssessment.assessmt_action_plan_tbl[0] = action;
    assessmentModel.addTeamAssessment(dummyData.user.details.shortEmail, valAssessment)
      .then(function(body){
        expect(body).to.be.equal(null);
      })
      .catch(function(err){
        expect(err.error.principle_id[0]).to.equal('Principle id is required.');
      })
      .finally(function(){
        action.principle_id = 2;
        curr_assessment = _.clone(valAssessment);
        done();
      });
  });
  
});

describe("assessment model [addTeamAssessment] ", function(){
  this.timeout(timeout);
  it("delete previous draft assessment", function(done){
    //make sure to have latest document revision id
    assessmentModel.deleteAssessment(dummyData.user.details.shortEmail, curr_assessment._id, currRevisionId)
      .then(function(body){
        expect(body).to.be.a('object');
        expect(body.ok).to.be.true;
      })
      .catch(function(err){
        expect(err.error).to.be.an('not_found');
      })
      .finally(function(){
        done();
      });
    });

  it("add assessment [no assessment id]", function(done){
    assessmentModel.addTeamAssessment(dummyData.user.details.shortEmail, noId)
      .then(function(body){
        expect(body).to.be.equal(null);
      })
      .catch(function(err){
        expect(err).to.have.property('error');
        expect(err.error._id[0]).to.be.equal('Record id is required.');
      })
      .finally(function(){
        done();
      })
  });

  it("add assessment [empty assessment id]", function(done){
    var emptyId = _.clone(curr_assessment);
    emptyId._id = '';
    assessmentModel.addTeamAssessment(dummyData.user.details.shortEmail, emptyId)
      .then(function(body){
        expect(body).to.be.equal(null);
      })
      .catch(function(err){
        expect(err).to.not.equal(null);
        expect(err).to.have.property('error');
        expect(err.error._id[0]).to.be.equal('Record id is required.');
      })
      .finally(function(){
        done();
      })
  });

  it("add assessment [valid assessment data]", function(done){
    assessmentModel.addTeamAssessment(dummyData.user.details.shortEmail, curr_assessment)
    .then(function(body){
      expect(body).to.be.a('object');
      expect(body.ok).to.be.true;
      expect(body.id).to.be.equal(curr_assessment._id);
      currRevisionId = body.rev;
    })
    .catch(function(err){
      expect(err.error).to.be.an('conflict');
    })
    .finally(function(){
      done();
    });
  });

  it("add assessment [duplicate assessment id]", function(done){
    assessmentModel.addTeamAssessment(dummyData.user.details.shortEmail, curr_assessment)
      .then(function(body){
        expect(body).to.be.equal(null);
      })
      .catch(function(err){
        expect(err.error).to.be.equal('conflict');
      })
      .finally(function(){
        done();
      });
  });
});

describe("assessment models [getTeamAssessments]", function(){ 
  this.timeout(timeout);
  it("retrieve team assessments [valid team id]", function(done){
    assessmentModel.getTeamAssessments(curr_assessment.team_id)
      .then(function(body){
        expect(body).to.be.a('object');
        expect(body).to.have.property('rows');
        expect(body.rows[0].key).to.be.equal(teamData._id);
      })
      .catch(function(err){
        expect(err.error).to.be.an('undefined');
      })
      .finally(function(){
        done();
      });
  });

  it("retrieve team assessments [non-existing team id]", function(done){
    assessmentModel.getTeamAssessments(invalidTeamId)
      .then(function(body){
        expect(body.rows).to.be.empty;
      })
      .catch(function(err){
        expect(err.error).to.be.an('undefined');
      })
      .finally(function(){
        done();
      })
  });

  it("retrieve team assessments [empty team id]", function(done){
    assessmentModel.getTeamAssessments('')
      .then(function(body){
        expect(body).to.be.equal(null);
      })
      .catch(function(err){
        expect(err).to.not.equal(null);
        expect(err).to.have.property('error');
        expect(err.error).to.be.equal('No team id provided.');
      })
      .finally(function(){
        done();
      })
  });
});
  
describe("assessment model [getAssessment] ", function(){ 
  this.timeout(timeout);
  
  it("retrieve assessment [non-existing assessment id]", function(done){
    assessmentModel.getAssessment(invalidAssessId)
      .then(function(body){
        expect(body.rows).to.be.empty;
      })
      .catch(function(err){
        expect(err).to.have.property('error');
        expect(err.error).to.be.equal('not_found');
      })
      .finally(function(){
        done();
      })
  });

  it("retrieve assessment [empty assessment id]", function(done){
    assessmentModel.getAssessment('')
      .then(function(body){
        expect(body).to.be.equal(null);
      })
      .catch(function(err){
        expect(err).to.not.equal(null);
        expect(err).to.have.property('error');
        expect(err.error).to.be.equal('No assessment id provided.');
      })
      .finally(function(){
        done();
      })
  });

  it("retrieve assessment [valid assessment id]", function(done){
    assessmentModel.getAssessment(curr_assessment._id)
      .then(function(body){
        expect(body).to.be.a('object');
        expect(body._id).equal(curr_assessment._id);
        currRevisionId = body._rev;
      })
      .catch(function(err){
        expect(err.error).to.be.equal('not_found');
      })
      .finally(function(){
        done();
      });
  });

});

describe("assessment model [updateTeamAssessment] ", function(){
  this.timeout(timeout);
  it("update assessment [no assessment id]", function(done){
    assessmentModel.updateTeamAssessment(dummyData.user.details.shortEmail, noId)
      .then(function(body){
        expect(body).to.be.equal(null);
      })
      .catch(function(err){
        expect(err).to.have.property('error');
        expect(err.error._id[0]).to.be.equal('Record id is required.');
      })
      .finally(function(){
        done();
      })
  });

  it("update assessment [empty assessment id]", function(done){
    var tempData = _.clone(curr_assessment);
    tempData._id='';
    assessmentModel.updateTeamAssessment(dummyData.user.details.shortEmail, tempData)
      .then(function(body){
        expect(body).to.be.equal(null);
      })
      .catch(function(err){
        expect(err).to.not.equal(null);
        expect(err).to.have.property('error');
        expect(err.error._id[0]).to.be.equal('Record id is required.');
      })
      .finally(function(){
        done();
      })
  });

  it("update assessment [valid assessment data]", function(done){
    //make sure to have latest document revision id
    var tempData = _.clone(curr_assessment);
    tempData.last_updt_user = dummyData.user.details.shortEmail;
    tempData._rev = currRevisionId;
    assessmentModel.updateTeamAssessment(dummyData.user.details.shortEmail, tempData)
      .then(function(body){
        expect(body).to.be.a('object');
        expect(body.id).equal(tempData._id);
        expect(body.ok).to.be.true;
        currRevisionId = body.rev;
      })
      .catch(function(err){
        expect(err.error).to.be.equal('conflict');
      })
      .finally(function(){
        done();
      });
  });
});

describe("assessment model [deleteAssessment] ", function(){
  this.timeout(timeout);
  it("delete assessment [non-existing assessment id]", function(done){
    assessmentModel.deleteAssessment(dummyData.user.details.shortEmail, invalidAssessId, currRevisionId)
      .then(function(body){
        expect(body).to.be.equal(null);
      })
      .catch(function(err){
        expect(err).to.have.property('error');
        expect(err.error).to.be.equal('not_found');
      })
      .finally(function(){
        done();
      })
  });

  it("delete assessment [empty assessment id]", function(done){
    assessmentModel.deleteAssessment(dummyData.user.details.shortEmail,'', currRevisionId)
      .then(function(body){
        expect(body).to.be.equal(null);
      })
      .catch(function(err){
        expect(err).to.have.property('error');
        expect(err.error).to.be.equal('No id/rev for record deletion.');
      })
      .finally(function(){
        done();
      })
  });

  it("delete assessment [non-existing revision id]", function(done){
    assessmentModel.deleteAssessment(dummyData.user.details.shortEmail, curr_assessment._id, invalidRevisionId)
      .then(function(body){
        expect(body).to.be.equal(null);
      })
      .catch(function(err){
        expect(err).to.have.property('error');
        expect(err.error).to.be.equal('conflict');
      })
      .finally(function(){
        done();
      })
  });

  it("delete assessment [empty revision id]", function(done){
    assessmentModel.deleteAssessment(dummyData.user.details.shortEmail,curr_assessment._id, '')
      .then(function(body){
        expect(body).to.be.equal(null);
      })
      .catch(function(err){
        expect(err).to.not.equal(null);
        expect(err).to.have.property('error');
        expect(err.error).to.be.equal('No id/rev for record deletion.');
      })
      .finally(function(){
        done();
      })
  });

  it("delete assessment [invalid assessment id and revision id]", function(done){
    assessmentModel.deleteAssessment(dummyData.user.details.shortEmail, invalidAssessId, invalidRevisionId)
      .then(function(body){
        expect(body).to.be.equal(null);
      })
      .catch(function(err){
        expect(err).to.have.property('error');
        expect(err.error).to.be.equal('not_found');
      })
      .finally(function(){
        done();
      })
  });
  
  it("delete assessment [valid assessment and revision id]", function(done){
    //make sure to have latest document revision id
    assessmentModel.deleteAssessment(dummyData.user.details.shortEmail, curr_assessment._id, currRevisionId)
      .then(function(body){
        expect(body).to.be.a('object');
        expect(body.ok).to.be.true;
      })
      .catch(function(err){
        expect(err.error).to.be.an('not_found');
      })
      .finally(function(){
        done();
      });
    });
});
});