var React = require('react');
var api = require('../api.jsx');
var _ = require('underscore');
var InlineSVG = require('svg-inline-react');


var HomeMemberTable = React.createClass({
  componentDidMount: function() {
    this.hoverBlock('team-member-table-content-location');
    this.hoverBlock('team-member-table-content-allocation');
    this.hoverBlock('team-member-table-content-awk');
  },
  componentDidUpdate: function() {
    this.hoverBlock('team-member-table-content-location');
    this.hoverBlock('team-member-table-content-allocation');
    this.hoverBlock('team-member-table-content-awk');
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

  render: function() {
    var self = this;
    if (self.props.loadDetailTeam.team == undefined) {
      return null;
    } else {
      team = self.props.loadDetailTeam.team;
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
            var src = 'http://dpev027.innovate.ibm.com:10000/image/' + member.userId.toUpperCase();
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
                <div onClick={self.delTeamMemberHandler.bind(null, idx)}>
                  <InlineSVG src={require('../../../img/Att-icons/att-icons_delete.svg')}></InlineSVG>
                </div>
              );
              var addTeamBtnStyle = false;
            } else {
              deletBtn = null;
              addTeamBtnStyle = true;
            }
            return (
              <div key={blockId} id={blockId} class={blockClass}>
                <div id={nameId} style={{'width':'29.8%'}}>
                  <div style={{'width':'28.6%','height':'100%','display':'inline-block','float':'left'}}>
                    <img src={src}></img>
                  </div>
                  <div style={{'width':'71.4%','height':'50%','display':'inline-block','float':'left','position':'relative','top':'25%'}}>
                    <h>{member.name}</h>
                    <br/>
                    <h1>{member.email}</h1>
                  </div>
                </div>
                <div id={roleId} style={{'width':'19.3%'}}>
                  <h>{memberDetail.role}</h>
                </div>
                <div class='team-member-table-content-location' id={locationId} style={{'width':'21.9%'}}>
                  <h>{mLocation}</h>
                </div>
                <div class='team-member-table-content-allocation' id={allocationId} style={{'width':'13.3%'}}>
                  <h>{memberDetail.allocation + '%'}</h>
                </div>
                <div class='team-member-table-content-awk' id={awkId} style={{'width':'15.7%'}}>
                  <h>Full time</h>
                  {deletBtn}
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
            <h class='team-member-table-close-btn' onClick={self.props.showTeamTable}>X</h>
          </div>
          <div class='team-member-table' id='memberTable'>
            <div class='team-member-table-header-block'>
              <div style={{'width':'29.6%'}}>
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
              <div style={{'width':'13.1%'}}>
                <h>Allocation</h>
              </div>
              <div style={{'width':'0.2%','backgroundColor':'#FFFFFF'}}>
              </div>
              <div style={{'width':'15.7%'}}>
                <h>Avg. work week</h>
              </div>
            </div>
            {teamMembers}
            <div class='team-member-table-footer-block'>
              <button type='button' class='ibm-btn-sec ibm-btn-blue-50' disabled={addTeamBtnStyle}>Add Team Member</button>
            </div>
          </div>
        </div>
      )
    }
  }
});

module.exports = HomeMemberTable;
