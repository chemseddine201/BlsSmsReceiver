// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397704
// To debug code on page load in Ripple or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.
(function() {
	"use strict";
	document.addEventListener('deviceready', onDeviceReady.bind(this), false);
	function onDeviceReady() {
		var url = "https://www.ayoubbls.com/";
		var sim_num;
		var device_model = device.model;
		var device_uuid = device.uuid;
		var device_serial = device.serial;
		document.getElementById('deviceModel').innerHTML = "Device Model: " + device_model;
		document.getElementById('deviceId').innerHTML = "Device uid: <strong>" + device_uuid + "</strong>";
		document.getElementById('deviceSerial').innerHTML = "Device Serial: " + device_serial;
	
		cordova.plugins.backgroundMode.setDefaults({
		title: "BLS SMS RECEIVER",
		text: "SMS sync",
		icon: 'platforms/android/res/mipmap-ldpi/ic_launcher.png', // this will look for icon.png in platforms/android/res/drawable|mipmap
		color: '0084FF',
		resume: true,
		hidden: false,
		bigText: false
		});
		cordova.plugins.backgroundMode.setEnabled(true);
		cordova.plugins.backgroundMode.excludeFromTaskList();
		cordova.plugins.backgroundMode.enable();
		// Handle the Cordova pause and resume events
		document.addEventListener('pause', onPause.bind(this), false);
		document.addEventListener('resume', onResume.bind(this), false);
		// Cordova has been loaded. Perform any initialization that requires Cordova here.
		/* Initialize sms-receive plugin */
		if(typeof (SMSReceive) === 'undefined') {
			// Error: plugin not installed
			alert('SMSReceive: plugin not present');
			document.getElementById('status').innerHTML = 'Error: The plugin <strong>cordova-plugin-sms-receive</strong> is not present';
		} else {
			SMSReceive.startWatch(function() {
				document.getElementById('status').innerHTML = 'SMS Watching started';
			}, function() {
				document.getElementById('status').innerHTML = 'Plugin failed to start watching';
			});
			// Initialize incoming SMS event listener
			document.addEventListener('onSMSArrive', function(e) {
				//window.plugins.sim.getSimInfo(successCallback, errorCallback);
				var IncomingSMS = e.data;
				//document.getElementById('event').innerHTML = JSON.stringify(e);
				var options = {
					  method: 'post',
					  data: { 
					  address: IncomingSMS.address, 
					  body: IncomingSMS.body ,
					  sim : IncomingSMS.sim , 
					  device_model : device_model,
					  device_uuid : device_uuid,
					  device_serial: device_serial
					  }
				};
				cordova.plugin.http.setServerTrustMode('nocheck', function() {
				  cordova.plugin.http.sendRequest(url + "pass_code.php", options, function(response) {
					 //alert(JSON.stringify(response));
					 //document.getElementById('event').innerHTML = JSON.stringify(response);
					 document.getElementById('event').innerHTML = '<div style="text-align:left !important">SMS from: ' + IncomingSMS.address + '<br />Service Center: ' + IncomingSMS.service_center + '<br />Received on: ' + IncomingSMS.date + '<br />Body: ' + IncomingSMS.body + '<br />SIM: ' + '<strong style="font-weight:700;">'+IncomingSMS.sim+'</strong></div>';
					}, function(response) {
					  alert('error ajax');
					  document.getElementById('event').innerHTML = JSON.stringify(response);
				});
				}, function() {
				  alert('error');
				});
			});

			// Bind Start Watch method to button 1
			document.getElementById('startWatch').addEventListener('click', function() {
				SMSReceive.startWatch(function() {
					document.getElementById('status').innerHTML = 'SMS Watching started';
				}, function() {
					document.getElementById('status').innerHTML = 'Plugin failed to start watching';
				});
			});

			// Bind Stop Watch method to button 2
			document.getElementById('stopWatch').addEventListener('click', function() {
				SMSReceive.stopWatch(function() {
					document.getElementById('status').innerHTML = 'SMS Watching stopped';
				}, function() {
					document.getElementById('status').innerHTML = 'Plugin failed to stop watching';
				});
			});
		}
		
		document.getElementById('deleteSim1').addEventListener('click', function() {
			delete_sms('1');
		});
		document.getElementById('deleteSim2').addEventListener('click', function() {
			delete_sms('2');		
		});
		function delete_sms(sim_num){
		var SMSoptions = {
				  method: 'post',
				  data: { 
				  sim: 'sim_' + sim_num, 
				  device_model : device_model,
				  device_uuid : device_uuid,
				  device_serial: device_serial
				  }
		};
		cordova.plugin.http.setServerTrustMode('nocheck', function() {
			cordova.plugin.http.sendRequest( url + "delete_sms.php", SMSoptions, function(response) {
				var message = response.data;
				document.getElementById('event').innerHTML = 'Waiting for event.';
				alert("SIM_" + sim_num + " " + message);
			}, function(response) {
				alert('ajax error');
			});
			}, function() {
				  alert('fatal error');
			});
	};
	};
	function onPause() {
		// TODO: This application has been suspended. Save application state here.
	};

	function onResume() {
		// TODO: This application has been reactivated. Restore application state here.
	};
	/*function successCallback(result) {
	document.getElementById('status').innerHTML = JSON.stringify(result);
	}
	function errorCallback(error) {
	alert(" SIM ERROR :" + JSON.stringify(error));
	}*/
})();