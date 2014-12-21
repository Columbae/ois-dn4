
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

function readLastVitals() {
	sessionId = getSessionId();	

	var ehrId = $("#meritveVitalnihZnakovEHRid").val();
	var tip = $("#readTypeForVitals").val();

	if (!ehrId || ehrId.trim().length == 0) {
		$("#readMeasurementsVitalsMsg").html("<span class='obvestilo label label-warning fade-in'>Enter patient EHR id!");
	}
	else {
		$.ajax({
			url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
	    	type: 'GET',
	    	headers: {"Ehr-Session": sessionId},
	    	success: function (data) {
				var party = data.party;
				$("#rezultatMeritveVitalnihZnakov").html("<br/><span>Last measurement vital signs data for <b>'" + party.firstNames + " " + party.lastNames + "'</b>.</span><br/><br/>");
				$.ajax({
				    url: baseUrl + "/view/" + ehrId + "/pulse/",
				    type: 'GET',
				    headers: {
				        "Ehr-Session": sessionId
				    },
				    success: function (res) {
				
				    	if (res.length > 0) {
				    		console.log(res);
				    		var bp = res[0].time + " | pulse rate:" + res[0].pulse;
							$("#rezultatMeritveVitalnihZnakov").append(bp);
				    	} else {
				    		console.log(res);
				    		$("#readMeasurementsVitalsMsg").html("<span class='obvestilo label label-warning fade-in'>Ni podatkov!</span>");
				    		return;
				    	}
				    }
				});	
				$.ajax({
				    url: baseUrl + "/view/" + ehrId + "/respirations",
				    type: 'GET',
				    headers: {
				        "Ehr-Session": sessionId
				    },
				    success: function (res) {
			    		console.log(res);
			    		var bp = " | respiratory rate:" + res[0].respirations;
						$("#rezultatMeritveVitalnihZnakov").append(bp);
				    }
				});
				$.ajax({
				    url: baseUrl + "/view/" + ehrId + "/spO2",
				    type: 'GET',
				    headers: {
				        "Ehr-Session": sessionId
				    },
				    success: function (res) {
			    		console.log(res);
			    		var bp = " | Oxygen saturation:" + res[0].spO2.toFixed(1);
						$("#rezultatMeritveVitalnihZnakov").append(bp);
				    }
				});
	    	},
	    	error: function(err) {
	    		$("#readMeasurementsVitalsMsg").html("<span class='obvestilo label label-danger fade-in'>Err '" + JSON.parse(err.responseText).userMessage + "'!");
				console.log(JSON.parse(err.responseText).userMessage);
	    	}
		});
	}
}

function readMeasurementsVitals() {
	var	tip = "pulse AQL";
	sessionId = getSessionId();	
	var ehrId = $("#meritveVitalnihZnakovEHRid").val();
	if (!ehrId || ehrId.trim().length == 0) {
		$("#readMeasurementsVitalsMsg").html("<span class='obvestilo label label-warning fade-in'>Enter patient EHR id!");
	} else {
		if (tip == "pulse AQL") {
			var AQL =
				"select " +
				"t/data[at0002]/events[at0003]/time/value as time, " +
				"t/data[at0002]/events[at0003]/data[at0001]/items[at0001]/value/magnitude as pulse_magnitude, " +
				"t/data[at0002]/events[at0003]/data[at0001]/items[at0004]/value/units as pulse_unit " +
				"from EHR e[e/ehr_id/value='" + ehrId + "'] " +
				"contains OBSERVATION t[openEHR-EHR-OBSERVATION.pulse.v1] " +
				"where t/data[at0002]/events[at0003]/data[at0001]/items[at0001]/value/magnitude>125 " +
				"order by t/data[at0002]/events[at0003]/time/value desc " +
				"limit 10";
				
					console.log(AQL);
			$.ajax({
				url: baseUrl + "/query?" + $.param({"aql": AQL}),
				type: 'GET',
				headers: {"Ehr-Session": sessionId},
				success: function (res) {
					var results = "<table class='table table-striped table-hover'><tr><th>Date and time</th><th class='text-right'>Pulse</th></tr>";
					if (res) {
						var rows = res.resultSet;
							for (var i in rows) {
								results += "<tr><td>" + rows[i].time + "</td><td class='text-right'>" + rows[i].pulse_magnitude + " " + rows[i].pulse_unit + "</td>";
							}
							results += "</table>";
							$("#rezultatMeritveVitalnihZnakov").append(results);
					} else {
						$("#readMeasurementsVitalsMsg").html("<span class='obvestilo label label-warning fade-in'>Ni podatkov!</span>");
					}
				},
				error: function() {
					$("#readMeasurementsVitalsMsg").html("<span class='obvestilo label label-danger fade-in'>Err '" + JSON.parse(err.responseText).userMessage + "'!");
					console.log(JSON.parse(err.responseText).userMessage);
				}
			});
		}
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