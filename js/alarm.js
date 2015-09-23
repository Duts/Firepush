/*
The MIT License (MIT)

Copyright (c) 2015 Robert Halandut, Andrey Kunitsyn

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

const defAlarmDelayOffline = 15; // Delay wakeup if app offline, just in case, we ordinary should get online event
const defAlarmDelayClose = 1; // Delay wakeup if connection just closed
const alarmType = 'Pushbullet wakeup'; // just to filter our alarms

function setAlarm(min){
	// There is no function to update alarm, then delete all before
	removeAllAlarms(function(){
		var request = navigator.mozAlarms.add(new Date((+new Date()) + min*60000), 'ignoreTimezone', {  type: alarmType });
		console.log('Setting alarm to', new Date((+new Date()) + min*60000) + '')
		request.onsuccess = function() { console.log('Successfully set');}
		request.onerror = function() { console.error('Error while setting alarm');}
	});
}

function removeAllAlarms(f){
	console.log('Removing all alarms...');
	var request = navigator.mozAlarms.getAll();
	request.onsuccess = function () {
  	this.result.forEach(function (alarm) {
		console.log('Removing alarm: ' + alarm.id);
		navigator.mozAlarms.remove(alarm.id);
  		});
	f();		
	};
}


function alarmHandler(alarm){
	if (alarm.data.type == alarmType) {
		console.log('Alarm fired');
		if (window.navigator.onLine) {
			if (websocket != null) {
				if (websocket.readyState == 3) {
					console.log("We online, but websocket is closed...");
					websocket.open()}
				}
			}
			else{
				console.log("We still offline, just in case we miss online event...");
				setAlarm(defAlarmDelayOffline);
			}
	}	
			
}
