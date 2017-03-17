var React = require('react');
var api = require('../api.jsx');
var _ = require('underscore');
var InlineSVG = require('svg-inline-react');

var facesPerson = {};

var HomeAddMember = React.createClass({
  componentDidUpdate: function() {
    facesPerson = {};
    // $('#teamMemberRoleSelect').select2({'width':'100%'});
  },
  componentDidMount: function() {
    var self = this;
    $('#teamMemberRoleSelect').select2({'width':'100%', 'dropdownParent':$('#addMemberBlock')});
    $('#teamMemberRoleSelect').change(self.roleHandler);
    $('#teamMemberAllocationSelect').select2({'width':'100%'});
    $('#teamMemberAwkSelect').select2({'width':'100%'});
    $('#teamMemberAwkSelect').change(self.changeAwkHandler);
    FacesTypeAhead.init(
      $('#teamMemberName'), {
        key: 'ciodashboard;agileteamtool@us.ibm.com',
        resultsAlign: 'left',
        showMoreResults: false,
        faces: {
          headerLabel: 'People',
          onclick: function(person) {
            self.facesClickHandler(person);
            return person['name'];
          }
        },
        topsearch: {
          headerLabel: 'w3 Results',
          enabled: false
        }
      });
  },
  componentWillUnmount: function() {
    $('.typeahead-results').remove();
  },

  facesClickHandler: function(person) {
    facesPerson = person;
    $('#teamMemberName').text(person.name);
  },

  nameInputOnChangeHandler: function() {
    facesPerson = {};
  },

  addTeamMemberHandler: function() {
    var self = this;
    if (_.isEmpty(facesPerson)) {
      alert('Cannot find this person on faces.');
    } else if ($('#teamMemberRoleSelect').val() == 'psr') {
      alert('Please select a role.');
    } else if ($('#teamMemberRoleSelect').val() == 'Other...' && $('#otherRole').val() == '') {
      alert('Please fill the role description.');
    } else {
      if (_.isEmpty(facesPerson.uid)) {
        alert('Cannot find this person on faces.');
      } else {
        if (!self.props.loadDetailTeam.access) {
          alert('You don\'t have access to add team memeber for this team.');
        } else {
          /*
          var isMemberExist = false;
          isMemberExist = _.find(self.props.loadDetailTeam.team.members, function(m){
            if (m.userId == facesPerson.uid.toUpperCase()) {
              return true;
            }
          })
          if (isMemberExist) {
            alert('This person is already in your team.');
          } else {
          */
            $('.team-member-add-block-footer > p > a').prop('disabled', true);
            var newTeamMembers = [];
            var newUsers = [];
            api.getUsersInfo([facesPerson.uid])
              .then(function(users){
                if (_.isEmpty(users)) {
                  var newUser = {
                    'userId': facesPerson.uid.toUpperCase(),
                    'email': facesPerson.email.toLowerCase(),
                    'name': facesPerson.name,
                    'location': {
                      'site': facesPerson.location.toLowerCase(),
                      'timezone': null
                    }
                  };
                  return api.createUser(newUser);
                } else {
                  return users[0];
                }
              })
              .then(function(result){
                var ntm = {
                  'userId': result.userId,
                  'name': result.name,
                  'email': result.email,
                  'role': $('#teamMemberRoleSelect').val() == 'Other...'?$('#otherRole').val():$('#teamMemberRoleSelect').val(),
                  'allocation': $('#teamMemberAllocationSelect').val(),
                  'workTime': $('#teamMemberAwkSelect').val() == 'other'?$('#otherAwk').val():$('#teamMemberAwkSelect').val()
                };
                newTeamMembers = JSON.parse(JSON.stringify(self.props.loadDetailTeam.team.members));
                newUsers = JSON.parse(JSON.stringify(self.props.loadDetailTeam.members));
                newTeamMembers.push(ntm);
                newUsers.push(result);
                return api.modifyTeamMembers(self.props.loadDetailTeam.team._id, newTeamMembers);
              })
              .then(function(result){
                self.props.reloadTeamMembers(newTeamMembers, newUsers);
                $('.team-member-add-block-footer > p > a').prop('disabled', false);
                self.props.hideAddTeamTable();
              })
              .catch(function(err){
                console.log(err);
                return;
              });
          /*
          } // if/else member exist
          */
        }
      }
    }
  },

  roleHandler: function(e) {
    if (e.target.value == 'Other...') {
      $('.team-member-add-block-content-allocation').css('top','20%');
      $('.team-member-add-block-content-awk').css('top','20%');
      $('#otherRole').fadeIn();
      setTimeout( function() {
        $('#otherRole').focus();
      }, 0);
    } else {
      $('.team-member-add-block-content-allocation').css('top','5%');
      $('.team-member-add-block-content-awk').css('top','5%');
      $('#otherRole').fadeOut();
    }
  },

  changeAwkHandler: function(e) {
    var self = this;
    if (e.target.value == 'other') {
      $('#otherAwk').fadeIn();
      setTimeout( function() {
        $('#otherAwk').focus();
      }, 0);
    } else {
      $('#otherAwk').fadeOut();
    }
  },

  wholeNumCheck: function(e) {
    var self = this;
    var pattern = /^\d*$/;
    if (e.charCode >= 32 && e.charCode < 127 &&  !pattern.test(String.fromCharCode(e.charCode)))
    {
      e.preventDefault();
    }
  },

  render: function () {
    var self = this;
    var allocationArray = Array.from(Array(101).keys())
    var allocationSelection = allocationArray.map(function(a){
      return (
        <option key={a} value={a}>{a}%</option>
      )
    });
    return (
      <div class='team-member-add-block' id='addMemberBlock'>
        <div class='team-member-add-block-header'>
          <h>Add Team Member</h>
          <div class='close-btn' onClick={self.props.hideAddTeamTable}>
            <InlineSVG src={require('../../../img/Att-icons/att-icons-close.svg')}></InlineSVG>
          </div>
        </div>
        <div class='team-member-add-block-content'>
          <div class='team-member-add-block-content-name'>
            <label for='teamMemberName'>Name</label>
            <input type='text' placeholder='Ex: Name or Email Adress' size='50' id='teamMemberName' name='teamMemberName' ref='teamMemberName' aria-label='team member' role='combobox' onChange={self.nameInputOnChangeHandler}/>
          </div>
          <div class='team-member-add-block-content-role'>
            <label for='teamMemberRole'>Role</label>
            <div class='role-select'>
              <select id='teamMemberRoleSelect' defaultValue='psr'>
                <option key='psr' value='psr'>Please select a role</option>
                {self.props.roleSelection}
              </select>
            </div>
          </div>
          <div class='team-member-add-block-content-other'>
            <input type='text' placeholder='Other role description' size='50' id='otherRole' name='otherRole' ref='otherRole' />
          </div>
          <div class='team-member-add-block-content-allocation'>
            <label for='teamMemberAllocation'>Allocation</label>
            <div class='allocation-select'>
              <select id='teamMemberAllocationSelect' defaultValue='100'>
                {allocationSelection}
              </select>
            </div>
          </div>
          <div class='team-member-add-block-content-awk'>
            <label for='teamMemberAwk'>Average Work Week</label>
            <div class='awk-select'>
              <select id='teamMemberAwkSelect' defaultValue='Full Time'>
                <option key='Full Time' value='100'>Full Time</option>
                <option key='Half Time' value='50'>Half Time</option>
                <option key='other' value='other'>Other</option>
              </select>
            </div>
            <div class='awk-input'>
              <input type='text' id='otherAwk' placeholder='Ex:50' min='0' max='100' maxLength='3' onKeyPress={self.wholeNumCheck}></input>
            </div>
          </div>
        </div>
        <div class='team-member-add-block-footer'>
          <p class='ibm-btn-row ibm-button-link' style={{'position':'relative','top':'30%','right':'5%','float':'right'}}>
            <a class='ibm-btn-pri ibm-btn-small ibm-btn-blue-50' onClick={self.addTeamMemberHandler}>Add</a>
            <a class='ibm-btn-sec ibm-btn-small ibm-btn-blue-50' onClick={self.props.hideAddTeamTable}>Cancel</a>
          </p>
        </div>
      </div>
    )
  }
});
module.exports = HomeAddMember;
