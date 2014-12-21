
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

function addVitalsMeasurements() {
	sessionId = getSessionId();

	var ehrId = $("#addVitalEHR").val();
	var dateAndTime = $("#addVitalDateAndTime").val();
	var pulse = $("#addVitalPulse").val();
	var respiratory = $("#addVitalRespiratoryRate").val();
	var oxygenSaturation = $("#addVitalOxygenSaturation").val();
	//var peakFlow = $("#addVitalPeakFlow").val();

	if (!ehrId || ehrId.trim().length == 0) {
		$("#addVitalsMeasurementsMsg").html("<span class='obvestilo label label-warning fade-in'>Enter patient EHR id!</span>");
	} else {
		$.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
		var podatki = {
			// Preview Structure: https://rest.ehrscape.com/rest/v1/template/Vital%20Signs/example
		    "ctx/language": "en",
		    "ctx/territory": "SI",
		    "ctx/time": dateAndTime,
		    "vital_signs/pulse:0/any_event:0/rate|magnitude":pulse,
		    "vital_signs/pulse:0/any_event:0/rate|unit":"/min",
		    "vital_signs/respirations:0/any_event:0/rate|magnitude":134.0,
		    "vital_signs/respirations:0/any_event:0/rate|unit":"/min",
		    "vital_signs/respirations:0/any_event:0/rhythm|code":"at0006",
		    "vital_signs/respirations:0/any_event:0/depth|code":"at0019",
		    "vital_signs/respirations:0/any_event:0/description":"Description 46",
		   	//"vital_signs/body_temperature/any_event/temperature|magnitude": peakFlow,
		    "vital_signs/indirect_oximetry:0/spo2|numerator": oxygenSaturation
		};
		var parametriZahteve = {
		    "ehrId": ehrId,
		    templateId: 'Vital Signs',
		    format: 'FLAT',
		    committer: "Vital signs measurements from wearable devices"
		};
		$.ajax({
		    url: baseUrl + "/composition?" + $.param(parametriZahteve),
		    type: 'POST',
		    contentType: 'application/json',
		    data: JSON.stringify(podatki),
		    success: function (res) {
		    	console.log(res.meta.href);
		    	console.log(res + respiratory + oxygenSaturation);
		    	console.log(podatki);
		        $("#addVitalsMeasurementsMsg").html("<span class='obvestilo label label-success fade-in'>" + res.meta.href + ".</span>");
		    },
		    error: function(err) {
		    	$("#addVitalsMeasurementsMsg").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
				console.log(JSON.parse(err.responseText).userMessage);
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
		var d = new Date(); 
		var x = d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate() + "T" + d.getHours() + ":" + d.getMinutes(); 
		$("#addVitalEHR").val(podatki[0]);
		$("#addVitalDateAndTime").val(x);
		
		//$("#addVitalPulse").val(podatki[2]);
		//$("#addVitalRespiratoryRate").val(podatki[3]);
		//$("#addVitalOxygenSaturation").val(podatki[4]);
		//$("#addVitalPeakFlow").val(podatki[5]);
	});
	$('#readEHRidForVitals').change(function() {
		//readMeasurements
		$("#readMeasurementsVitalsMsg").html("");
		$("#rezultatMeritveVitalnihZnakov").html("");
		$("#meritveVitalnihZnakovEHRid").val($(this).val());
	});
});