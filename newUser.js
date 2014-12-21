
var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";

function getSessionId() {
    var response = $.ajax({
        type: "POST",
        url: baseUrl + "/session?username=" + encodeURIComponent(username) +
                "&password=" + encodeURIComponent(password),
        async: false
    });
    return response.responseJSON.sessionId;
}


function createPatientsEHR() {
	sessionId = getSessionId();

	var ime = $("#createName").val();
	var priimek = $("#createSurname").val();
	var datumRojstva = $("#createDOB").val();

	if (!ime || !priimek || !datumRojstva || ime.trim().length == 0 || priimek.trim().length == 0 || datumRojstva.trim().length == 0) {
		$("#createMsg").html("<span class='obvestilo label label-warning fade-in'>Prosim vnesite zahtevane podatke!</span>");
	} else {
		$.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
		$.ajax({
		    url: baseUrl + "/ehr",
		    type: 'POST',
		    success: function (data) {
		        var ehrId = data.ehrId;
		        var partyData = {
		            firstNames: ime,
		            lastNames: priimek,
		            dateOfBirth: datumRojstva,
		            partyAdditionalInfo: [{key: "ehrId", value: ehrId}]
		        };
		        $.ajax({
		            url: baseUrl + "/demographics/party",
		            type: 'POST',
		            contentType: 'application/json',
		            data: JSON.stringify(partyData),
		            success: function (party) {
		                if (party.action == 'CREATE') {
		                    $("#createMsg").html("<span class='obvestilo label label-success fade-in'>Uspešno kreiran EHR '" + ehrId + "'.</span>");
		                    console.log("Uspešno kreiran EHR '" + ehrId + "'.");
		                    $("#readEHRid").val(ehrId);
		                }
		            },
		            error: function(err) {
		            	$("#createMsg").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
		            	console.log(JSON.parse(err.responseText).userMessage);
		            }
		        });
		    }
		});
	}
}


$(document).ready(function() {
	$('#readExistingEHR').change(function() {
		$("#readMsg").html("");
		$("#readEHRid").val($(this).val());
	});
	$('#readPatientData').change(function() {
		$("#createMsg").html("");
		var podatki = $(this).val().split(",");
		$("#createName").val(podatki[0]);
		$("#createSurname").val(podatki[1]);
		$("#createDOB").val(podatki[2]);
	});
	$('#readExistingVitals').change(function() {
		$("#addVitalsMeasurementsMsg").html("");
		var podatki = $(this).val().split("|");
		$("#addVitalEHR").val(podatki[0]);
		$("#addVitalDateAndTime").val(podatki[1]);
		$("#addVitalPulse").val(podatki[2]);
		$("#addVitalRespiratoryRate").val(podatki[3]);
		$("#addVitalOxygenSaturation").val(podatki[4]);
		//$("#addVitalPeakFlow").val(podatki[5]);
	});
	$('#readEHRidForVitals').change(function() {
		//readMeasurements
		$("#readMeasurementsVitalsMsg").html("");
		$("#rezultatMeritveVitalnihZnakov").html("");
		$("#meritveVitalnihZnakovEHRid").val($(this).val());
	});
});