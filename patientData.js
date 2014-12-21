
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


function readPatientsEHR() {
	sessionId = getSessionId();

	var ehrId = $("#readEHRid").val();

	if (!ehrId || ehrId.trim().length == 0) {
		$("#readMsg").html("<span class='obvestilo label label-warning fade-in'>Prosim vnesite zahtevan podatek!");
	} else {
		$.ajax({
			url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
			type: 'GET',
			headers: {"Ehr-Session": sessionId},
	    	success: function (data) {
				var party = data.party;
				$("#readMsg").html("<span class='obvestilo label label-success fade-in'>Bolnik '" + party.firstNames + " " + party.lastNames + "', ki se je rodil '" + party.dateOfBirth + "'.</span>");
				console.log("Bolnik '" + party.firstNames + " " + party.lastNames + "', ki se je rodil '" + party.dateOfBirth + "'.");
			},
			error: function(err) {
				$("#readMsg").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
				console.log(JSON.parse(err.responseText).userMessage);
			}
		});
	}	
}


function addVitalsMeasurements() {
	sessionId = getSessionId();

	var ehrId = $("#addVitalEHR").val();
	var dateAndTime = $("#addVitalDateAndTime").val();
	var pulse = $("#addVitalPulse").val();
	var respiratoryRate = $("#addVitalRespiratoryRate").val();
	var oxygenSaturation = $("#addVitalOxygenSaturation").val();
	//var peakFlow = $("#addVitalPeakFlow").val();

	if (!ehrId || ehrId.trim().length == 0) {
		$("#addVitalsMeasurementsMsg").html("<span class='obvestilo label label-warning fade-in'>Prosim vnesite zahtevane podatke!</span>");
	} else {
		$.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
		var podatki = {
			// Preview Structure: https://rest.ehrscape.com/rest/v1/template/Vital%20Signs/example
		    "ctx/language": "en",
		    "ctx/territory": "SI",
		    "ctx/time": dateAndTime,
		    //"vital_signs/pulse": pulse,
		    "vital_signs/pulse:0/any_event:0/rate|magnitude":pulse,
		    "vital_signs/pulse:0/any_event:0/rate|unit":"/min",
		    "vital_signs/respirations:0/any_event:0/rate|magnitude":respiratoryRate,
		    "vital_signs/respirations:0/any_event:0/rate|unit":"/min",
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
		        $("#addVitalsMeasurementsMsg").html("<span class='obvestilo label label-success fade-in'>" + res.meta.href + ".</span>");
		    },
		    error: function(err) {
		    	$("#addVitalsMeasurementsMsg").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
				console.log(JSON.parse(err.responseText).userMessage);
		    }
		});
	}
}


function readMeasurementsVitals() {
	sessionId = getSessionId();	

	var ehrId = $("#meritveVitalnihZnakovEHRid").val();
	var tip = $("#readTypeForVitals").val();
	/*
	if(tip || tip.trim().length != 0){
		if (!ehrId || ehrId.trim().length == 0) {
			$("#readMeasurementsVitalsMsg").html("<span class='obvestilo label label-warning fade-in'>Prosim vnesite zahtevan podatek!");
		} else {
			$.ajax({
				url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
		    	type: 'GET',
		    	headers: {"Ehr-Session": sessionId},
		    	success: function (data) {
					var party = data.party;
					$("#rezultatMeritveVitalnihZnakov").html("<br/><span>Pridobivanje podatkov za <b>'" + tip + "'</b> bolnika <b>'" + party.firstNames + " " + party.lastNames + "'</b>.</span><br/><br/>");
					if (tip == "pulse") {
						$.ajax({
						    url: baseUrl + "/view/" + ehrId + "/pulse",
						    type: 'GET',
						    headers: {
						        "Ehr-Session": sessionId
						    },
						    success: function (res) {
						
						    	if (res.length > 0) {
							    	var results = "<table class='table table-striped table-hover'><tr><th>Datum in ura</th><th class='text-right'>Telesna teža</th></tr>";
							        for (var i in res) {
							            results += "<tr><td>" + res[i].time + "</td><td class='text-right'>" + res[i].pulse + " " 	+ res[i].unit + "</td>";
							        }
							        results += "</table>";
							        $("#rezultatMeritveVitalnihZnakov").append(results);
						    	} else {
						    		$("#readMeasurementsVitalsMsg").html("<span class='obvestilo label label-warning fade-in'>Ni podatkov!</span>");
						    	}
						        /*res.forEach(function (el, i, arr) {
						            var date = new Date(el.time);
						            el.date = date.getTime();
						        });*//*
						
						    }
						});
					} else if (tip == "telesna teža") {
						$.ajax({
						    url: baseUrl + "/view/" + ehrId + "/" + "weight",
						    type: 'GET',
						    headers: {"Ehr-Session": sessionId},
						    success: function (res) {
						    	if (res.length > 0) {
							    	var results = "<table class='table table-striped table-hover'><tr><th>Datum in ura</th><th class='text-right'>Telesna teža</th></tr>";
							        for (var i in res) {
							            results += "<tr><td>" + res[i].time + "</td><td class='text-right'>" + res[i].weight + " " 	+ res[i].unit + "</td>";
							        }
							        results += "</table>";
							        $("#rezultatMeritveVitalnihZnakov").append(results);
						    	} else {
						    		$("#readMeasurementsVitalsMsg").html("<span class='obvestilo label label-warning fade-in'>Ni podatkov!</span>");
						    	}
						    },
						    error: function() {
						    	$("#readMeasurementsVitalsMsg").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
								console.log(JSON.parse(err.responseText).userMessage);
						    }
						});					
					} else if (tip == "telesna temperatura AQL") {
						var AQL = 
							"select " +
	    						"t/data[at0002]/events[at0003]/time/value as cas, " +
	    						"t/data[at0002]/events[at0003]/data[at0001]/items[at0004]/value/magnitude as temperatura_vrednost, " +
	    						"t/data[at0002]/events[at0003]/data[at0001]/items[at0004]/value/units as temperatura_enota " +
							"from EHR e[e/ehr_id/value='" + ehrId + "'] " +
							"contains OBSERVATION t[openEHR-EHR-OBSERVATION.body_temperature.v1] " +
							"where t/data[at0002]/events[at0003]/data[at0001]/items[at0004]/value/magnitude<35 " +
							"order by t/data[at0002]/events[at0003]/time/value desc " +
							"limit 10";
						$.ajax({
						    url: baseUrl + "/query?" + $.param({"aql": AQL}),
						    type: 'GET',
						    headers: {"Ehr-Session": sessionId},
						    success: function (res) {
						    	var results = "<table class='table table-striped table-hover'><tr><th>Datum in ura</th><th class='text-right'>Telesna temperatura</th></tr>";
						    	if (res) {
						    		var rows = res.resultSet;
							        for (var i in rows) {
							            results += "<tr><td>" + rows[i].cas + "</td><td class='text-right'>" + rows[i].temperatura_vrednost + " " 	+ rows[i].temperatura_enota + "</td>";
							        }
							        results += "</table>";
							        $("#rezultatMeritveVitalnihZnakov").append(results);
						    	} else {
						    		$("#readMeasurementsVitalsMsg").html("<span class='obvestilo label label-warning fade-in'>Ni podatkov!</span>");
						    	}
	
						    },
						    error: function() {
						    	$("#readMeasurementsVitalsMsg").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
								console.log(JSON.parse(err.responseText).userMessage);
						    }
						});
					}
		    	},
		    	error: function(err) {
		    		$("#readMeasurementsVitalsMsg").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
					console.log(JSON.parse(err.responseText).userMessage);
		    	}
			});
		}
	} else {*/
		$.ajax({
			url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
	    	type: 'GET',
	    	headers: {"Ehr-Session": sessionId},
	    	success: function (data) {
				var party = data.party;
				$("#rezultatMeritveVitalnihZnakov").html("<br/><span>Pridobivanje zadnjih podatkov za bolnika <b>'" + party.firstNames + " " + party.lastNames + "'</b>.</span><br/><br/>");
				$.ajax({
				    url: baseUrl + "/view/" + ehrId + "/pulse",
				    type: 'GET',
				    headers: {
				        "Ehr-Session": sessionId
				    },
				    success: function (res) {
				
				    	if (res.length > 0) {
				    		console.log(res);
				    		var bp = res[0].time + "    " + res[0].pulse + "/" + res[0].respiratory + " " + res[0].indirect_oximetry;
							$("#rezultatMeritveVitalnihZnakov").append(bp);
				    	} else {
				    		$("#readMeasurementsVitalsMsg").html("<span class='obvestilo label label-warning fade-in'>Ni podatkov!</span>");
				    	}
				        /*res.forEach(function (el, i, arr) {
				            var date = new Date(el.time);
				            el.date = date.getTime();
				        });*/
				
				    }
				});
	    	},
	    	error: function(err) {
	    		$("#readMeasurementsVitalsMsg").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
				console.log(JSON.parse(err.responseText).userMessage);
	    	}
		});
//	}
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