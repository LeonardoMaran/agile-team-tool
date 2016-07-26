var chai = require('chai');
var expect = chai.expect;
var otherModel = require('../../models/others');
var timeout = 30000;
var adminId = 'ag_ref_access_control';
var systemId = 'ag_ref_system_status_control';

describe("Other models [getAdmins]: get admins and supports", function(done){
  this.timeout(timeout);
  it("return admins and supports", function(done){
    otherModel.getAdmins(adminId)
      .then(function(body){
        expect(body).to.be.a('object');
        expect(body).to.have.property('ACL_Full_Admin');
        expect(body).to.have.property('ACL_User_Supt');
      })
      .catch(function(err){
        expect(err.error).to.be.an('undefined');
      })
      .finally(function(){
        done();
      });
  });
});

describe("Other models [getSystemStatus]: get system status", function(done){
  this.timeout(timeout);
  it("return system status", function(done){
    otherModel.getSystemStatus(systemId)
      .then(function(body){
        expect(body).to.be.a('object');
        expect(body).to.have.property('agildash_system_status_values_tbl');
      })
      .catch(function(err){
        expect(err.error).to.be.an('undefined');
      })
      .finally(function(){
        done();
      });
  });
});

describe("Other models [getServerTime]: get server time", function(done){
  this.timeout(timeout);
  it("return server time", function(done){
    var sTime = otherModel.getServerTime();
    expect(sTime).to.be.a('string');
    done();
  });
})
