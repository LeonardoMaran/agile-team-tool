var chai = require('chai');
var expect = chai.expect;
var util = require('../../helpers/util');
var timeout = 30000;
var adminId = 'ag_ref_access_control';
var systemId = 'ag_ref_system_status_control';

describe("Util models [getAdmins]: get admins and supports", function(done){
  this.timeout(timeout);
  it("return admins and supports", function(done){
    util.getAdmins(adminId)
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

describe("Util models [getSystemStatus]: get system status", function(done){
  this.timeout(timeout);
  it("return system status", function(done){
    util.getSystemStatus(systemId)
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

describe("Util models [getServerTime]: get server time", function(done){
  this.timeout(timeout);
  it("return server time", function(done){
    var sTime = util.getServerTime();
    expect(sTime).to.be.a('string');
    done();
  });
})

// describe("Util models [BulkDelete]: delete a couple docs", function(done){
//   var ids = ['01a4073afd76c2cde8dcf42a56f25gg1', '10a4073afd76c2gge8dcf42a56f25741'];
//   it("should reject", function(done){
//     util.BulkDelete(ids)
//       .catch(function(err){
//         console.log("$$@@ " + typeof(err));
//         expect(err.error).to.be.a('object');
//       })
//       .finally(function(){
//         done();
//       });
//   });
// });
