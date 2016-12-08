var React = require('react');
var api = require('../api.jsx');
var HomeMemberTable = require('./HomeMemberTable.jsx');
var InlineSVG = require('svg-inline-react');
var Promise = require('bluebird');
var _ = require('underscore');
var teamName = ''
var teamType = ''

var HomeTeamHeader = React.createClass({
  componentWillUpdate: function(nextProps, nextState){
    // if (nextProps.loadDetailTeam.type == 'squad') {
    //   teamType = 'Squad: ';
    // } else {
    //   teamType = 'Team: ';
    // }
    // teamName = nextProps.loadDetailTeam.team.name;
  },
  componentDidUpdate: function() {
  },
  findTeamInAllTeams: function(pathId) {
    selectedTeam = pathId;
    this.props.tabClickedHandler('allteams', pathId);
  },
  teamMemFTE: function(teamMembers) {
     var teamCount = 0;
     var tmArr = [];
     _.each(teamMembers, function(member) {
       teamCount += parseInt(member.allocation);
     });
     return (teamCount / 100);
  },
  showTeamTable: function() {
    if ($('#teamMemberTable').css('display') == 'none') {
      $('#teamMemberTable').fadeIn();
    } else {
      $('#teamMemberTable').fadeOut();
    }
  },
  render: function() {
    //console.log(this.props.selectedTeam);
    var self = this
    var headerStyle= {
      'display': 'inline'
    };

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
      var squadMarkDisplay = {
        'display': 'none'
      };
      if (team.type == 'squad') {
        squadMarkDisplay['display'] = 'block';
      }
      if (self.props.loadDetailTeam.hierarchy == undefined || self.props.loadDetailTeam.hierarchy.error || self.props.loadDetailTeam.hierarchy.length == 0) {
        var teamHierarchy = '';
        var teamHierarchy2 = null;
      } else {
        var hierarchy = self.props.loadDetailTeam.hierarchy;
        teamHierarchy = hierarchy.map(function(h){
          var plink = 'plink_' + h.pathId;
          if ($('#' + h.pathId).length) {
            return (
              <div key={plink} style={{'display':'inline'}}>
                <a class='hierarchy-link' title='View parent team information' alt='View parent team information' id={plink} href='#' onClick={()=>self.props.selectedTeamChanged(h.pathId)}>{h.name}</a>
                <h class='hierarchy-mark'>&nbsp;&nbsp;&#10095;&nbsp;&nbsp;</h>
              </div>
            );
          } else {
            return (
              <div key={plink} style={{'display':'inline'}}>
                <a class='hierarchy-link' title='View parent team information' alt='View parent team information' id={plink} href='#' onClick={()=>self.findTeamInAllTeams(h.pathId)}>{h.name}</a>
                <h class='hierarchy-mark'>&nbsp;&nbsp;&#10095;&nbsp;&nbsp;</h>
              </div>
            );
          }
        });
        var teamHierarchy2 = teamName;
      }
      var faceImages = null;
      if (team.members != undefined) {
        var teamMemNumber = team.members.length;
        var teamFTE = self.teamMemFTE(team.members);
        var count = 0;
        var faceImages = team.members.map(function(member){
          if (count < 10) {
            var faceImageId = 'faceImage_' + count;
            var src = 'http://dpev027.innovate.ibm.com:10000/image/' + member.userId.toUpperCase();
            count ++ ;
            return (
              <img key={faceImageId} id={faceImageId} class='home-team-header-member-image' src={src}></img>
            )
          }
        })
      } else {
        teamMemNumber = 0;
        teamFTE = 0;
      }
      return (
        <div class='home-team-header'>
          {/*<h2 class='heading-teamType' id="teamType">{teamType}</h2>*/}
          <div class='home-team-header-title'>
            <div class='home-team-header-img-div' style={squadMarkDisplay}>
              <InlineSVG class='home-team-header-img' src={require('../../../img/Att-icons/att-icons_tribe.svg')}></InlineSVG>
            </div>
            <div class='home-team-header-teamname-div'>
              <h class='home-team-header-teamname' style={headerStyle} id="teamName">{teamName}</h>
              <div class='home-team-header-teamname-btn'>
                <InlineSVG class='home-team-header-teamname-btn-img' src={require('../../../img/Att-icons/att-icons_info.svg')}></InlineSVG>
              </div>
              <div class='home-team-header-teamname-btn'>
                <InlineSVG class='home-team-header-teamname-btn-img' src={require('../../../img/Att-icons/att-icons_info.svg')}></InlineSVG>
              </div>
              <div class='home-team-header-description-div'>
                <div class='home-team-header-description-arrow'>
                  <InlineSVG class='home-team-header-description-arrow-img' src={require('../../../img/Att-icons/play-arrow.svg')}></InlineSVG>
                </div>
                <div class='home-team-header-description-title'>
                  <h>Team Description</h>
                  <h1>X</h1>
                </div>
                <div class='home-team-header-description-content'>
                  <div>
                    <h1>
                      aa
                    </h1>
                  </div>

                </div>
              </div>
            </div>
          </div>
          <div class='home-team-header-hierarchy'>
            <tr id='Hierarchy'>
              <td>
                {teamHierarchy}
                <div class='hierarchy-lastteam'>
                  {teamHierarchy2}
                </div>
              </td>
            </tr>
          </div>
          <div class='home-team-header-btns-div'>
            <div class='home-team-header-btns'>
              <InlineSVG class='home-team-header-btn-img' src={require('../../../img/Att-icons/att-icons_info.svg')}></InlineSVG>
              <div class='home-team-header-btn-title'>
                <h>Team Bookmarks</h>
              </div>
            </div>
            <div class='home-team-header-btns'>
              <InlineSVG class='home-team-header-btn-img' src={require('../../../img/Att-icons/att-icons_info.svg')}></InlineSVG>
              <div class='home-team-header-btn-title'>
                <h>Maturity Assessment</h>
              </div>
            </div>
            <div class='home-team-header-btns2'>
              <InlineSVG onClick={()=>self.showTeamTable()} class='home-team-header-btn-img2' src={require('../../../img/Att-icons/att-icons_info.svg')}></InlineSVG>
              <div class='home-team-header-btn-title2'>
                <h>}</h>
              </div>
              <div class='home-team-header-members-div'>
                {faceImages}
              </div>
            </div>
          </div>
          <HomeMemberTable loadDetailTeam={this.props.loadDetailTeam} showTeamTable={this.showTeamTable}/>
        </div>
      )
    }
  }
});

module.exports = HomeTeamHeader;
