var React = require('react');
var api = require('../api.jsx');
var HomeSpinner = require('./HomeSpinner.jsx');
var _ = require('underscore');
var Promise = require('bluebird');

var selectedTeam = '';

var HomeTeamTree = React.createClass({
  componentDidMount: function() {
  },

  componentWillUpdate: function() {
  },

  shouldComponentUpdate: function(nextProps, nextState) {
    if (nextProps.newTeams == this.props.newTeams) {
      if (nextProps.searchTeamSelected != this.props.searchTeamSelected && nextProps.searchTeamSelected != '') {
        this.loadTeamInAllTeams(nextProps.searchTeamSelected);
        $('#searchTree').hide();
      }
      return false;
    } else {
      return true;
    }
  },

  componentDidUpdate: function() {
    var self = this;
    $('#navSpinner').hide();
    $('#searchTree').hide();
    $('#teamTree').show();
    $('.nano').nanoScroller();
    self.initHilightTeam();
  },

  triggerTeam: function(teamId) {
    var self = this;
    if ($('#' + teamId).hasClass('ibm-active')) {
      self.highlightParents(teamId);
      self.collapseParentTeam(teamId);
    } else {
      self.removeHighlightParents(teamId);
      self.expandParentTeam(teamId);
    }
  },

  removeHighlightParents: function(teamId) {
    if (teamId != null) {
      $($('#' + teamId).children('a.agile-team-link')[0]).removeClass('agile-team-parent-selected');
    } else {
      $('#teamTree a.agile-team-parent-selected').removeClass('agile-team-parent-selected');
    }
  },

  highlightParents: function(teamId) {
    if (teamId != null) {
      $('#' + teamId).removeClass('agile-team-parent-selected');
      if (teamId != '' && $('#' + teamId + ' a.agile-team-selected').length == 1) {
        $($('#' + teamId).children('a.agile-team-link')[0]).addClass('agile-team-parent-selected');
      }
    } else {
      var li = $('#teamTree a.agile-team-selected').parents('li');
      for (var i = 1; i <= li.length; i++) {
        var element = li[i];
        $($(element).children('a.agile-team-link')[0]).addClass('agile-team-parent-selected');
      }
    }
  },

  highlightTeam: function(teamId){
    if (selectedTeam != '') {
      $('#link_' + selectedTeam).removeClass('agile-team-selected');
    }
    if ($('#link_' + teamId).hasClass('agile-team-selected')) {

    } else {
      $('#link_' + teamId).addClass('agile-team-selected');
    }
  },

  initHilightTeam: function() {
    var self = this;
    if (selectedTeam == '') {
      if (($('#teamTree li')[0]).id) {
        if (($('#teamTree li')[0]).id != 'agteamstandalone') {
          selectedTeam = ($('#teamTree li')[0]).id;
        } else {
          if (selectedTeam = ($('#teamTree li')[1]).id) {
            selectedTeam = ($('#teamTree li')[1]).id;
          }
        }
      }
      self.highlightTeam(selectedTeam);
    } else {
      if ($('#myTeams').attr('data-state') == 'open') {
        if (($.find('#' + selectedTeam)).length > 0) {
          self.highlightTeam(selectedTeam);
        } else {
          if (($('#teamTree li')[0]).id) {
            if (($('#teamTree li')[0]).id != 'agteamstandalone') {
              selectedTeam = ($('#teamTree li')[0]).id;
              self.highlightTeam(selectedTeam);
            } else {
              if (selectedTeam = ($('#teamTree li')[1]).id) {
                selectedTeam = ($('#teamTree li')[1]).id;
                self.highlightTeam(selectedTeam);
              } else {
                selectedTeam = '';
              }
            }
          } else {
            selectedTeam = '';
          }
        }
      } else {
        self.loadTeamInAllTeams(selectedTeam);
      }
    }
    console.log('sel:',selectedTeam);
  },

  expandParentTeam: function(teamId) {
    var self = this;
    if (teamId != null) {
      if ($('#' + teamId).attr('data-open') == 'false') {
        //var objectId = $('#' + teamId).children('span').html();
        //getChildrenTeams(parentId, false);
        api.getChildrenTeams(teamId)
        .then(function(teams){
          self.appendChildTeams(teams, teamId);
        })
        .catch(function(err){
          console.log(err);
        });
      } else {
        $('#' + teamId).attr('data-open', 'true');
        $('#' + teamId).addClass('ibm-active');
        $('#body_' + teamId).css('display', 'block');
        $('.nano').nanoScroller();
      }
    }
  },

  appendChildTeams: function(teams, teamId) {
    var self = this;
    if (!_.isEmpty(teams)) {
      $('#body_' + teamId).append(self.createMainTwistySection('main_' + teamId, ''));
      _.each(teams, function(team){
        if (team.docStatus != 'delete') {
          $('#main_' + teamId).append(self.createSubSection(team));
          var trigger = $('#' + team.pathId).find('a.ibm-twisty-trigger');
          trigger.attr('title', 'Expand/Collapse').on('click', function() {
            self.triggerTeam(team.pathId);
          });
          var link = $('#link_' + team.pathId);
          link.on('click', function() {
            self.loadDetails(team.pathId);
          });
        }
      })
      $('#' + teamId).attr('data-open', 'true');
      $('#' + teamId).addClass('ibm-active');
      $('#body_' + teamId).css('display', 'block');
      $('.nano').nanoScroller();
    }
  },

  collapseParentTeam: function(teamId) {
    $('#' + teamId).removeClass('ibm-active');
    $('#body_' + teamId).css('display', 'none');
    $('.nano').nanoScroller();
  },

  loadDetails: function(teamId) {
    var self = this;
    $('.nano').nanoScroller();
    self.highlightTeam(teamId);
    selectedTeam = teamId;
    var objectId = $('#' + teamId).children('span').html();
    var promiseArray = [];
    promiseArray.push(api.loadTeam(objectId));
    if ($('#link_' + teamId).hasClass('agile-team-squad')) {
      var isSquad = true;
      promiseArray.push(api.getSquadIterations(objectId));
      promiseArray.push(api.getSquadAssessments(objectId));
    } else {
      isSquad = false;
      promiseArray.push(api.getTeamSnapshots(objectId));
    }
    $('#contentSpinner').show();
    $('#squad_team_scard').hide();
    $('#nsquad_team_scard').hide();
    Promise.all(promiseArray)
    .then(function(results){
      self.props.selectedTeam(results);
    })
    .catch(function(err){
      console.log(err);
      $('#contentSpinner').hide();
    });
  },

  loadTeamInAllTeams: function(teamId) {
    var self = this;
    $('#navSpinner').show();
    $('#teamTree').hide();
    var path = [];
    api.loadTeamDetails(teamId)
    .then(function(team){
      if (team != null) {
        if (team.path != null) {
          path = (team.path.substring(1,team.path.length-1)).split(',');
        } else {
          if (!team.hasChild) {
            path.push('agteamstandalone');
          }
        }
        path.push(team.pathId);
        var promiseArray = [];
        _.each(path, function(pathId){
          promiseArray.push(api.getChildrenTeams(pathId));
        });
        return Promise.all(promiseArray);
      } else {
        return Promise.reject('no team found');
      }
    })
    .then(function(results){
      for (var i = 0; i < results.length; i++) {
        self.appendChildTeams(results[i], path[i]);
      }
      self.loadDetails(path[path.length-1]);
      $('#navSpinner').hide();
      $('#teamTree').show();
      $('.nano').nanoScroller();
      $('.nano').nanoScroller({
        scrollTo: $('#link_' + path[path.length-1])
      });
    })
    .catch(function(err){
      $('#navSpinner').hide();
      $('#teamTree').show();
      self.highlightTeam(($('#teamTree li')[0]).id);
      console.log(err);
    });
  },

  createMainTwistySection: function(twistyId, extraClass) {
    var ul = document.createElement('ul');
    ul.setAttribute('class', 'ibm-twisty ' + extraClass);
    ul.setAttribute('id', twistyId);
    return ul;
  },

  createSubSection: function(team) {
    var extraClass = '';
    if (team.type == 'squad') {
      extraClass = extraClass + 'agile-team-squad';
    }
    if (!team.hasChild) {
      extraClass = extraClass + ' agile-team-standalone';
    }
    var li = document.createElement('li');
    li.setAttribute('data-open', 'false');
    if (extraClass.indexOf('agile-team-standalone') > -1)
      li.setAttribute('class', 'agile-team-standalone');
    li.setAttribute('id', team.pathId);

    var spanLink = document.createElement('span');
    spanLink.setAttribute('class', 'ibm-access');
    spanLink.appendChild(document.createTextNode(team.name));

    var span = document.createElement('a');
    span.setAttribute('class', 'ibm-twisty-trigger');
    span.setAttribute('href', '#toggle');
    span.appendChild(spanLink);
    li.appendChild(span);

    var href = document.createElement('a');
    href.setAttribute('class', 'agile-team-link ' + extraClass);
    href.setAttribute('title', 'View ' + team.name + ' team information ');
    href.setAttribute('id', 'link_' + team.pathId);
    href.appendChild(document.createTextNode(team.name));
    li.appendChild(href);

    //we're putting this span to hold the relevant team id
    span = document.createElement('span');
    span.setAttribute('class', 'ibm-access');
    span.appendChild(document.createTextNode(team._id));
    li.appendChild(span);

    var div = document.createElement('div');
    div.setAttribute('class', 'ibm-twisty-body');
    div.setAttribute('id', 'body_' + team.pathId);
    div.setAttribute('display', 'none');
    li.appendChild(div);

    return li;
  },

  render: function() {
    var self = this;
    var teamTreeStyle = {
      'display': 'block'
    };
    if (this.props.newTeams.tab == 'myteams') {
      if (_.isUndefined(this.props.newTeams.data.teams)) {
        return null;
      } else {
        var myteams = this.props.newTeams.data.teams.map(function(team) {
          if (team.docStatus == 'delete') {
            return;
          }
          var teamId = team.pathId;
          var linkId = 'link_' + team.pathId;
          var bodyId = 'body_' + team.pathId;
          var label = team.name;
          var objectId = team._id;
          if (team.type == 'squad') {
            var isSquad = 'agile-team-link agile-team-standalone agile-team-squad';
          } else {
            isSquad = 'agile-team-link agile-team-standalone';
          }
          if (team.hasChild == false) {
            var hasChild = 'agile-team-standalone';
          } else {
            var hasChild = '';
          }
          var title = 'view ' + team.name + ' information';
          return (
            <li class={hasChild} key={objectId} data-open='false' id={teamId}>
              <a class='ibm-twisty-trigger' href='#toggle' title='Expand/Collapse' onClick={()=>self.triggerTeam(teamId)}>
                <span class='ibm-access'>{label}</span>
              </a>
              <a class={isSquad} title={title} id={linkId} onClick={()=>self.loadDetails(teamId)}>{label}</a>
              <span class='ibm-access'>{objectId}</span>
              <div class='ibm-twisty-body' id={bodyId} style={{'display':'none'}}></div>
            </li>
          );
        });
        // standalone teams
        var standaloneTeams = this.props.newTeams.data.standalone.map(function(team) {
          if (team.docStatus == 'delete') {
            return null;
          }
          var teamId = team.pathId;
          var linkId = 'link_' + team.pathId;
          var bodyId = 'body_' + team.pathId;
          var label = team.name;
          var objectId = team._id;
          if (team.type == 'squad') {
            var isSquad = 'agile-team-link agile-team-standalone agile-team-squad';
          } else {
            isSquad = 'agile-team-link agile-team-standalone';
          }
          var title = 'view ' + team.name + ' information';
          return (
            <li class='agile-team-standalone' key={objectId} data-open='false' id={teamId}>
              <a class={isSquad} title={title} id={linkId}>{label}</a>
            </li>
          );
        })
        if (_.isEmpty(this.props.newTeams.data.standalone)) {
          return (
            <div id='teamTree' style={teamTreeStyle}>
              <ul class='ibm-twisty  ibm-widget-processed' id='teamTreeMain'>
                {myteams}
              </ul>
            </div>
          );
        } else {
          return (
            <div id='teamTree' style={teamTreeStyle}>
              <ul class='ibm-twisty  ibm-widget-processed' id='teamTreeMain'>
                {myteams}
                <li data-open='true' id='agteamstandalone' class='ibm-active'>
                  <a class='ibm-twisty-trigger' href='#toggle' title='Expand/Collapse' onClick={()=>self.triggerTeam('agteamstandalone')}>
                    <span class='ibm-access'>Standalone Teams</span>
                  </a>
                  <a class='agile-team-link'>Standalone Teams</a>
                  <span class='ibm-access'>agteamstandalone</span>
                  <div class='ibm-twisty-boddy' id='body_agteamstandalone' style={{'display':'block'}}>
                    <ul class='ibm-twisty ' id='main_agteamstandalone'>
                      {standaloneTeams}
                    </ul>
                  </div>
                </li>
              </ul>
            </div>
          );
        }
      }
    } else if (this.props.newTeams.tab == 'allteams') {
      var allteams = this.props.newTeams.data.map(function(team) {
        if (team.docStatus == 'delete') {
          return null;
        }
        var teamId = team.pathId;
        var linkId = 'link_' + team.pathId;
        var bodyId = 'body_' + team.pathId;
        var mainId = 'main_' + team.pathId;
        var label = team.name;
        var objectId = team._id;
        var title = 'view ' + team.name + ' information';
        return (
          <li data-open='false' id={teamId} key={objectId}>
            <a class='ibm-twisty-trigger' href='#toggle' title='Expand/Collapse' onClick={()=>self.triggerTeam(teamId)}>
              <span class='ibm-access'>{label}</span>
            </a>
            <a class='agile-team-link' title={title} id={linkId} onClick={()=>self.loadDetails(teamId)}>{label}</a>
            <span class='ibm-access'>{objectId}</span>
            <div class='ibm-twisty-body' id={bodyId} style={{'display':'none'}}>
            </div>
          </li>
        );
      });
      return (
        <div id='teamTree' style={teamTreeStyle}>
          <ul class='ibm-twisty  ibm-widget-processed' id='teamTreeMain'>
            <ul class='ibm-twisty ' id='main_'>
              {allteams}
              <li data-open='false' id='agteamstandalone'>
                <a class='ibm-twisty-trigger' href='#toggle' title='Expand/Collapse' onClick={()=>self.triggerTeam('agteamstandalone')}>
                  <span class='ibm-access'>Standalone Teams</span>
                </a>
                <a class='agile-team-link' title='View Standalone Teams information'>Standalone Teams</a>
                <span class='ibm-access'>agteamstandalone</span>
                <div class='ibm-twisty-body' id='body_agteamstandalone' style={{'display':'none'}}>
                </div>
              </li>
            </ul>
          </ul>
        </div>
      );
    } else {
      return null;
    }
  }
});

module.exports = HomeTeamTree;
