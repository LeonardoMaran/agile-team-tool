var ccIds = [];
var valCount = 0;
var hasError = false;
jQuery(function($) {
	$(document).ready(function() {
		$("#feedback").keyup(function() {
			if ($("#feedback").val().trim() !== ""){
				$("#feeback_submit").removeAttr("disabled");
			}
			else{
				$("#feeback_submit").attr("disabled","disabled");
			}
		});
	});
});

function teamNamesHandler(teams) {
	var listOption = [];
	for ( var i = 0; i < teams.length; i++) {
		var option = [];
		option.push(teams[i].name);
		option.push(teams[i].name);
		listOption.push(option);
	}
	setSelectOptions("feedback_teamName", listOption, ["Not specified", "Not specified"], null, "Not specified");
}

function submitFeedback(){
	valCount = 0;
	hasError = false;
	ccIds = [];
	var result = validateEmail();
	if (result){
		processFeedback();
	}
}

function processFeedback() {
	$("#feeback_submit").attr("disabled","disabled");
	$("#sendFeedback").css("cursor", "progress");
	$.ajax({
		type : "POST",
		url : "/email/feedback",
		data: {
			"feedback_recipient":$("#feedback_recipient").val(), 
			"feedback_sender":$("#feedback_sender").val(),
			"feedback_senderName":$("#feedback_senderName").val(),
			"feedback_cc": "", 
			"feedback_page":$("#feedback_page").val(), 
			"feedback_teamName":$("#feedback_teamName").val(), 
			"feedback":$("#feedback").val()
		},
		async : true
	}).done(function(message) {
		$("#sendFeedback").css("cursor", "default");
		showMessagePopup(message);
		IBMCore.common.widget.overlay.hide('sendFeedback');
	});
}

function closeFeedback(){
	$("#sendFeedback").css("cursor", "default");
	IBMCore.common.widget.overlay.hide('sendFeedback');
}

function initFeedback(userEmail){
	hasError = false;
	ccIds = [];
	valCount = 0;
	$("#feedback_recipient").val(feedbackTo);
	$("#feedback_sender").val(userInfo.email);
	$("#feedback_senderName").val(userInfo.name);
	$("#feedback_cc").val("");//(userInfo.email);
	$("#feedback_teamName").val("");
	$("#feedback").val("");
	$("#userEmail").html(userInfo.email);
	document.getElementById('feedback_cancel').disabled = false;
}

function launchFeeback(userEmail) {
	// this variable is set on main page
	if (typeof globalTeamList != "undefined" && !_.isEmpty(globalTeamList)) {
		teamNamesHandler(globalTeamList)
	} else if (typeof allTeams != "undefined" && !_.isEmpty(allTeams)) {
		if (_.has(allTeams, '_root'))
			teamNamesHandler(_.sortBy(
				_.union(allTeams._root, allTeams._branch, allTeams._standalone ), function(team) {return team.name}));
		else
			teamNamesHandler(allTeams)
	} else {
		getTeamNames(teamNamesHandler, []);
	}

	IBMCore.common.widget.overlay.show('sendFeedback');
	$("#feeback_submit").attr("disabled","disabled");
	initFeedback(userEmail);
}

function validateEmail(){
	var isValid = false;
	var ids = $("#feedback_cc").val();
	if (ids === "" || ids.indexOf("/") == -1){
		isValid = true;
	}
	if (ids !== ""){
		ids = ids.split(",");
		$.each(ids, function(index, item){
			if (item.length > 1 && item !== " "){
				item = item.replace(/^\s\s*/,'').replace(/\s*$/,'');
				if (item.indexOf("/")>0){
					valCount +=1;
					getEmail(item);
				}
				else{
					if (ccIds.indexOf(item) == -1){
						ccIds.push(item);
					}
				}
			}
		});
	}
	return isValid;
}


function getEmail(notesId){
	var facesRoot = 'https://faces.tap.ibm.com/api/';
	var facesFunc = 'find/?format=faces&q=notes/id:' + encodeURIComponent(notesId); 
	var facesURL = facesRoot + facesFunc;

	$.ajax({
		'global' : false,
		'cache' : false,
		'url' : facesURL,
		'timeout' : 5000,
		'jsonp' : 'callback',
		'scriptCharset': 'UTF-8',
		'success' : function (data) {
			if (data.persons.length === 0){
				showMessagePopup(emailIDError);
				return false;
			}
			var facesPerson = data.persons[0].person;
			if (facesPerson["notes-id"] == notesId) {
				var emailId = facesPerson.email;
				if (ccIds.indexOf(emailId) == -1){
					ccIds.push(emailId);
				}
				valCount --;
				if (valCount <= 0 && !hasError){
					processFeedback();
				}
			}
			else{
				hasError = true;
				showMessagePopup(emailIDError);
				return false;
			}
		},
		'error' : function (data, status, error) {
			valCount --;
			hasError = true;
			showMessagePopup(status);
			return false;
		}
	});
}