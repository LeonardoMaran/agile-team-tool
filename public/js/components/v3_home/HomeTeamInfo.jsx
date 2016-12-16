var React = require('react');
var api = require('../api.jsx');
var _ = require('underscore');

var HomeTeamInfo = React.createClass({
 teamMemFTE: function(teamMembers) {
    var teamCount = 0;
    var tmArr = [];
    _.each(teamMembers, function(member) {
      teamCount += parseInt(member.allocation);
    });
    return (teamCount / 100);
  },

  findTeamInAllTeams: function(pathId) {
    selectedTeam = pathId;
    this.props.tabClickedHandler('allteams', pathId);
    // var self = this;
    // api.getAllTeams()
    // .then(function(data){
    //   var newData = {
    //     'tab': 'allteams',
    //     'data': data
    //   };
    //   self.props.newTeamsChanged(newData);
    //   self.props.searchTeamSelectedChanged(pathId);
    // });
  },

  render: function() {
    var self = this;
    if (this.props.loadDetailTeam.team == undefined) {
      return null;
    } else {
      var team = this.props.loadDetailTeam.team;
      if (team.name != undefined) {
        var teamName = team.name;
      } else {
        teamName = '';
      }
      if (team.description != undefined) {
        var teamDescription = team.description;
      } else {
        teamDescription = '';
      }
      if (this.props.loadDetailTeam.hierarchy == undefined || this.props.loadDetailTeam.hierarchy.error || this.props.loadDetailTeam.hierarchy.length == 0) {
        var teamHierarchy = 'No parent infomation';
        var teamHierarchy2 = null;
      } else {
        var hierarchy = this.props.loadDetailTeam.hierarchy;
        teamHierarchy = hierarchy.map(function(h){
          var plink = 'plink_' + h.pathId;
          if ($('#' + h.pathId).length) {
            return (
              <div key={plink} style={{'display':'inline'}}>
                <a class='wlink' style={{'display':'inline','paddingLeft':'0px'}} title='View parent team information' alt='View parent team information' id={plink} href='#' onClick={self.props.selectedTeamChanged.bind(null, h.pathId)}>{h.name}</a>
                <h>{' > '}</h>
              </div>
            );
          } else {
            return (
              <div key={plink} style={{'display':'inline'}}>
                <a class='wlink' style={{'display':'inline','paddingLeft':'0px'}} title='View parent team information' alt='View parent team information' id={plink} href='#' onClick={self.findTeamInAllTeams.bind(null, h.pathId)}>{h.name}</a>
                <h>{' > '}</h>
              </div>
            );
          }
        });
        var teamHierarchy2 = teamName;
      }
      if (team.links != undefined && team.links.length > 0) {
        var teamLinks = team.links.map(function(link){
          return (
            <tr key={link.linkLabel}>
              <td>{link.linkLabel}</td>
              <td>
                <a href={link.linkUrl} target='_blank' class='wlink'>{link.linkUrl}</a>
              </td>
            </tr>
          )
        });
      } else {
        teamLinks = null;
      }
      if (team.members != undefined) {
        var teamMemNumber = team.members.length;
        var teamFTE = this.teamMemFTE(team.members);
      } else {
        teamMemNumber = 0;
        teamFTE = 0;
      }
      var teamHref = '/team?id=' + team._id;
      return (
        <div>
          <div>
            <h2 class='ibm-bold ibm-h4' style={{'display':'inline-block', 'width':'50%', 'float':'left'}}>Team Information</h2>
          </div>
          <table class='ibm-data-table' id='levelTable' summary="__REPLACE_ME__">
            <thead class='ibm-access'>
              <tr>
                <th scope='col' colSpan='2'>Team Information</th>
              </tr>
            </thead>
            <tbody id='levelDetail'>
              <tr id='Team Name'>
                <td>
                  <p>Team Name</p>
                </td>
                <td>
                  <p>
                    <a class='wlink' href={teamHref} title='Manage team information'>{teamName}</a>
                  </p>
                </td>
              </tr>
              <tr id='Description'>
                <td>
                  <p>Description</p>
                </td>
                <td>
                  <p>{teamDescription}</p>
                </td>
              </tr>
              <tr id='Hierarchy'>
                <td>
                  <p>Hierarchy</p>
                </td>
                <td>
                  {teamHierarchy}{teamHierarchy2}
                </td>
              </tr>
              {teamLinks !== null &&
                <tr id='Important links'>
                  <td>
                    <p>Important links</p>
                  </td>
                  <td>
                    <table class='tImportantlink'>
                      <tbody>
                        {teamLinks}
                      </tbody>
                    </table>
                  </td>
                </tr>
              }
              <tr id='Number of members'>
                <td>
                  <p>Number of members</p>
                </td>
                <td>
                  <p>{teamMemNumber}</p>
                </td>
              </tr>
              <tr id='FTE'>
                <td>
                  <p>FTE</p>
                </td>
                <td>
                  <p>{teamFTE}</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )
    }
  }
});

module.exports = HomeTeamInfo;
