var React = require('react');
var api = require('../api.jsx');
var _ = require('underscore');
var HomeAddMember = require('./HomeAddMember.jsx');
var InlineSVG = require('svg-inline-react');
var Modal = require('react-overlays').Modal;


var HomeMemberTable = React.createClass({
  getInitialState: function() {
    return { showModal: false };
  },
  componentDidMount: function() {
    this.initialAll();
    $('.team-member-table-content-role > div > select').change(this.changeMemberHandler);
    $('.team-member-table-content-allocation > div > select').change(this.changeMemberHandler);
    $('.team-member-table-content-awk > div > select').change(this.changeMemberHandler);
  },
  componentDidUpdate: function() {
    this.initialAll();
  },

  initialAll: function() {
    $('.team-member-table-content-role > div > select').select2({'width':'100%'});
    $('.team-member-table-content-allocation > div > select').select2({'width':'100%'});
    $('.team-member-table-content-awk > div > select').select2({'width':'100%'});
    this.hoverBlock('team-member-table-content-role');
    // this.hoverBlock('team-member-table-content-location');
    this.hoverBlock('team-member-table-content-allocation');
    this.hoverBlock('team-member-table-content-awk');
    this.onClickBlock('team-member-table-content-role');
    this.onClickBlock('team-member-table-content-allocation');
    this.onClickBlock('team-member-table-content-awk');
  },

  onClickBlock: function(block) {
    $('.' + block + ' > h').css('display','');
    $('.' + block + ' > div').css('display','none');
    $('.' + block).off('click');
    if (this.props.loadDetailTeam.access) {
      $('.' + block).click(function(){
        $('.team-member-table-content-role > h').css('display','');
        $('.team-member-table-content-role > div').css('display','none');
        $('.team-member-table-content-allocation > h').css('display','');
        $('.team-member-table-content-allocation > div').css('display','none');
        $('.team-member-table-content-awk > h').css('display','');
        $('.team-member-table-content-awk > div').css('display','none');
        $(this).find('h').css('display', 'none');
        $(this).find('div').css('display', 'block');
      });
    }
  },

  hoverBlock: function(block) {
    $('.' + block + ' > h').unbind('mouseenter mouseleave');
    if (this.props.loadDetailTeam.access) {
      $('.' + block + ' > h').hover(function(){
        $(this).css('border','0.1em solid');
        $(this).css('background-color','#FFFFFF');
        $(this).css('padding-top','0.2em');
        $(this).css('cursor','pointer');
      }, function(){
        $(this).css('border','');
        $(this).css('background-color','');
        $(this).css('padding-top','0');
        $(this).css('cursor','default');
      });
    }
  },
  delTeamMemberHandler: function(idx) {
    var self = this;
    var blockId = 'name_' + idx;
    var memberEmail = $('#' + blockId + ' > div > h1').html();
    var newMembers = [];
    var newMembersContent = [];
    var r = confirm('Do you want to delete this member: ' + memberEmail + '?');
    if (r) {
      _.each(self.props.loadDetailTeam.team.members, function(member){
        if (member.email != memberEmail) {
          newMembers.push(member);
        }
      });
      _.each(self.props.loadDetailTeam.members, function(member){
        if (member.email != memberEmail) {
          newMembersContent.push(member);
        }
      });
      // self.props.loadDetailTeam.team.members = newMembers;
      api.modifyTeamMembers(self.props.loadDetailTeam.team._id, newMembers)
        .then(function(results){
          self.props.realodTeamMembers(newMembers, newMembersContent);
          // console.log(results);
        })
        .catch(function(err){
          console.log(err);
        });
    }
  },
  changeMemberHandler: function(e) {
    var self = this;
    var newMembers = [];
    if (e.target.id.indexOf('role') >= 0) {
      var blockId = 'name_' + e.target.id.substring(12, e.target.id.length);
      $('#role_' + e.target.id.substring(12, e.target.id.length) + ' > h').html(e.target.value);
      $('#role_' + e.target.id.substring(12, e.target.id.length) + ' > h').css('display','');
      $('#role_' + e.target.id.substring(12, e.target.id.length) + ' > div').css('display','none');
    } else if (e.target.id.indexOf('allocation') >= 0) {
      blockId = 'name_' + e.target.id.substring(18, e.target.id.length);
      $('#allocation_' + e.target.id.substring(18, e.target.id.length) + ' > h').html(e.target.value + '%');
      $('#allocation_' + e.target.id.substring(18, e.target.id.length) + ' > h').css('display','');
      $('#allocation_' + e.target.id.substring(18, e.target.id.length) + ' > div').css('display','none');

    } else {
      blockId = 'name_' + e.target.id.substring(11, e.target.id.length);
      $('#awk_' + e.target.id.substring(12, e.target.id.length) + ' > h').html(e.target.value);
      $('#awk_' + e.target.id.substring(12, e.target.id.length) + ' > h').css('display','');
      $('#awk_' + e.target.id.substring(12, e.target.id.length) + ' > div').css('display','none');
    }
    var memberEmail = $('#' + blockId + ' > div > h1').html();
    _.each(self.props.loadDetailTeam.team.members, function(member){
      if (member.email != memberEmail) {
        newMembers.push(member);
      } else {
        var pm = JSON.parse(JSON.stringify(member));
        if (e.target.id.indexOf('role') >= 0) {
          pm['role'] = e.target.value;
        } else if (e.target.id.indexOf('allocation') >= 0) {
          pm['allocation'] = e.target.value;
        } else {
        }
        newMembers.push(pm);
      }
    });
    api.modifyTeamMembers(self.props.loadDetailTeam.team._id, newMembers)
      .then(function(results){
        // console.log(results);
      })
      .catch(function(err){
        console.log(err);
      });
  },
  showAddTeamTable: function() {
    this.setState({ showModal: true });
  },
  hideAddTeamTable: function() {
    this.setState({ showModal: false });
  },
  toTitleCase: function(str) {
    if (_.isEmpty(str)) return '';
    var strArray = str.toUpperCase().split(',');
    if (strArray.length < 3) {
      return str.toUpperCase();
    } else {
      strArray[0] = strArray[0].replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
      return strArray.join(', ');
    }
  },

  validateAllocation: function(e) {
    console.log(e.key);
    if (e.key=='Enter') {
      console.log(e);
    }
  },

  wholeNumCheck: function(e) {
    var pattern = /^\d*$/;
    if (e.charCode >= 32 && e.charCode < 127 &&  !pattern.test(String.fromCharCode(e.charCode)))
    {
      e.preventDefault();
    }
  },

  render: function() {
    var self = this;
    var backdropStyle = {
      top: 0, bottom: 0, left: 0, right: 0,
      zIndex: 'auto',
      backgroundColor: '#000',
      opacity: 0.5,
      width: '100%',
      height: '100%'
    };
    var modalStyle = {
      position: 'fixed',
      width: '100%',
      height: '100%',
      zIndex: 1040,
      top: 0, bottom: 0, left: 0, right: 0,
    };
    if (self.props.loadDetailTeam.team == undefined) {
      return null;
    } else {
      team = self.props.loadDetailTeam.team;
      var allocationArray = Array.from(Array(101).keys())
      var allocationSelection = allocationArray.map(function(a){
        return (
          <option key={a} value={a}>{a}%</option>
        )
      });
      var roleSelection = self.props.roles.map(function(r){
        return (
          <option key={r} value={r}>{r}</option>
        )
      });
      if (team.members == null || team.members.length == 0) {
        var teamMembers = null;
      } else {
        var members = _.sortBy(self.props.loadDetailTeam.members, function(member){
          return member.name.toLowerCase();
        });
        if (self.props.loadDetailTeam.access) {
          var addTeamBtnStyle = false;
        } else {
          addTeamBtnStyle = true;
        }
        teamMembers = members.map(function(member, idx){
          if (idx <= 14) {
            var memberDetail = _.find(team.members, function(m){
              if (m.userId == member.userId) {
                return {
                  'role': m.role,
                  'allocation': m.allocation
                }
              }
            });
            var mLocation = self.toTitleCase(member.location.site);
            //var src = 'http://dpev027.innovate.ibm.com:10000/image/' + member.userId.toUpperCase();
            // var src = '//images.w3ibm.mybluemix.net/image/' + member.userId.toUpperCase();
            var src = '//faces-cache.mybluemix.net/image/' + member.userId.toUpperCase();
            var blockColor = {
              'backgroundColor': '#FFFFFF'
            }
            var blockClass = 'team-member-table-content-block1';
            if (idx % 2 != 0) {
              blockColor['backgroundColor'] = '#EFEFEF';
              blockClass = 'team-member-table-content-block2';
            }
            var blockId = 'member_'+idx;
            var nameId = 'name_'+idx;
            var locationId = 'location_'+idx;
            var roleId = 'role_'+idx;
            var allocationId = 'allocation_'+idx;
            var awkId = 'awk_'+idx;
            if (self.props.loadDetailTeam.access) {
              var deletBtn = (
                <span onClick={self.delTeamMemberHandler.bind(null, idx)}>
                  <InlineSVG src={require('../../../img/Att-icons/att-icons_delete.svg')}></InlineSVG>
                </span>
              );
              var addTeamBtnStyle = false;
            } else {
              deletBtn = null;
              addTeamBtnStyle = true;
            }
            return (
              <div key={blockId} id={blockId} class={blockClass}>
                <div style={{'width':'1%','backgroundColor':'#FFFFFF'}}>
                </div>
                <div id={nameId} style={{'width':'28.8%'}}>
                  <div style={{'width':'25.6%','height':'100%','display':'inline-block','float':'left'}}>
                    <img style={{'position':'relative', 'top':'17%'}} src={src}></img>
                  </div>
                  <div style={{'width':'74.4%','height':'50%','display':'inline-block','float':'left','position':'relative','top':'25%'}}>
                    <h>{member.name}</h>
                    <br/>
                    <h1>{member.email}</h1>
                  </div>
                </div>
                <div class='team-member-table-content-role' id={roleId} style={{'width':'19.3%'}}>
                  <h>{memberDetail.role}</h>
                  <div>
                    <select id={'role_select_' + idx} defaultValue={memberDetail.role}>
                      {roleSelection}
                    </select>
                  </div>
                </div>
                <div class='team-member-table-content-location' id={locationId} style={{'width':'21.9%'}}>
                  <h>{mLocation}</h>
                </div>
                <div class='team-member-table-content-allocation' id={allocationId} style={{'width':'11.3%'}}>
                  <h>{memberDetail.allocation+'%'}</h>
                  <div>
                    {/*<select id={'allocation_select_' + idx} defaultValue={memberDetail.allocation}>
                      {allocationSelection}
                    </select>*/}
                    <input type='text' placeholder='Ex:50' min='0' max='100' maxLength='3' onKeyPress={self.wholeNumCheck}></input>
                    <div class='member-table-allocation-btn'>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
                    </div>
                    <div class='member-table-allocation-btn' style={{'left':'5%'}}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
                    </div>
                  </div>
                </div>
                <div class='team-member-table-content-awk' id={awkId} style={{'width':'16.7%'}}>
                  <h>Full time</h>
                  <div>
                    <select id={'awk_select_' + idx} defaultValue='Full Time'>
                      <option key='Full Time' value='Full Time'>Full Time</option>
                      <option key='Part Time' value='Part Time'>Part Time</option>
                    </select>
                  </div>
                  {deletBtn}
                </div>
                <div style={{'width':'1%','backgroundColor':'#FFFFFF'}}>
                </div>
              </div>
            )
          }
        });
      }
      return (
        <div id='teamMemberTable' style={{'display':'none'}}>
          <div class='team-member-table-title-div'>
            <h class='team-member-table-title'>Team Details</h>
            <div class='team-member-table-close-btn' onClick={self.props.showTeamTable}>
              <InlineSVG src={require('../../../img/Att-icons/att-icons-close.svg')}></InlineSVG>
            </div>
          </div>
          <div class='team-member-table' id='memberTable'>
            <div class='team-member-table-header-block'>
              <div style={{'width':'1%','backgroundColor':'#FFFFFF'}}>
              </div>
              <div style={{'width':'28.6%'}}>
                <h>Name</h>
              </div>
              <div style={{'width':'0.2%','backgroundColor':'#FFFFFF'}}>
              </div>
              <div style={{'width':'19.1%'}}>
                <h>Role</h>
              </div>
              <div style={{'width':'0.2%','backgroundColor':'#FFFFFF'}}>
              </div>
              <div style={{'width':'21.7%'}}>
                <h>Location</h>
              </div>
              <div style={{'width':'0.2%','backgroundColor':'#FFFFFF'}}>
              </div>
              <div style={{'width':'11.1%'}}>
                <h>Allocation</h>
              </div>
              <div style={{'width':'0.2%','backgroundColor':'#FFFFFF'}}>
              </div>
              <div style={{'width':'16.7%'}}>
                <h>Avg. work week</h>
              </div>
              <div style={{'width':'1%','backgroundColor':'#FFFFFF'}}>
              </div>
            </div>
            {teamMembers}
            <div class='team-member-table-footer-block'>
              <div class='team-member-table-footer'>
                <button type='button' class='ibm-btn-sec ibm-btn-blue-50' disabled={addTeamBtnStyle} onClick={self.showAddTeamTable}>Add Team Member</button>
              </div>
            </div>
          </div>
          <Modal aria-labelledby='modal-label' style={modalStyle} backdropStyle={backdropStyle} show={self.state.showModal} onHide={self.hideAddTeamTable}>
            <HomeAddMember realodTeamMembers={self.props.realodTeamMembers} loadDetailTeam={self.props.loadDetailTeam} roleSelection={roleSelection} hideAddTeamTable={self.hideAddTeamTable}/>
          </Modal>
        </div>
      )
    }
  }
});

module.exports = HomeMemberTable;
