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

var pushesIsUpdating = false;
var notDismissedPushes = [];
var websocket;

function loginRQ(){
	if (!window.navigator.onLine) {console.log("We offline!"); return}
	var login_request = new XMLHttpRequest();
	login_request.open("GET","https://api.pushbullet.com/v2/users/me",false);
	login_request.setRequestHeader("Authorization", "Bearer "+localStorage.getItem("token"));
	login_request.send();
	console.log(login_request);
	var parse_login = JSON.parse(login_request.responseText);
	if (login_request.readyState == 4 && login_request.status == 200) {
		var email = "";
		email +=  parse_login.email;
		localStorage.setItem("email_user",email);
		var name = "";
		name += parse_login.name;
		localStorage.setItem("name",name);
		var avatar = "";
		avatar += parse_login.image_url;
		localStorage.setItem("avatar",avatar);
		localStorage.setItem("login","1");
		}else if(login_request.status == 403 || login_request.status == 401 || login_request.status == 400 || login_request.status == 404){
			alert(parse_login.error.message);}	
}


function updatePushesRQ(last_modified, f) {
	if (!window.navigator.onLine) {console.log("We offline!"); return}
	pushesIsUpdating = true;
	if (last_modified == undefined) {last_modified = 0}
	var push_request = new XMLHttpRequest();
	var request_string = "https://api.pushbullet.com/v2/pushes?modified_after="+ last_modified;
	if (last_modified == 0) {request_string += "&limit=25";
		if (localStorage.getItem("server_cursor")) {request_string +="&cursor=" + localStorage.getItem("server_cursor")};
							};
	push_request.open("GET",request_string,true);
	push_request.setRequestHeader("Authorization","Bearer "+localStorage.getItem("token"));
	push_request.send();
	console.log(push_request);
	push_request.onreadystatechange=function()
	{
		if (push_request.readyState == 4 && push_request.status == 200) {
			var parse_push = JSON.parse(push_request.responseText);
			console.log(push_request);
			if (last_modified == 0) {
					if (parse_push.cursor) { localStorage.setItem("server_cursor",parse_push.cursor)}
						else {localStorage.removeItem("server_cursor")}
									};
			sequentialSetPushesDB(parse_push.pushes, updatePushView, function(){
				for (var i = 0; i < parse_push.pushes.length; i++) {
					//setPushDB(parse_push.pushes[i], updatePushView);
					//updatePushView(parse_push.pushes[i])
					if (parse_push.pushes[i].modified) {
						if (localStorage.getItem("last_modified") < parse_push.pushes[i].modified) { localStorage.setItem("last_modified",parse_push.pushes[i].modified); }
						}
					}
				getNotDismissedPushesDB(function(e){
					notDismissedPushes = e;
					dismissVisiblePushes();
					showNotification(notDismissedPushes);	
					}
									   );
			});
		}else if(push_request.status == 400 || push_request.status == 401 || push_request.status == 403 || push_request.status == 404){
			alert(parse_push.error.message);
		}
		pushesIsUpdating = false;
	}

}


function sendNoteRQ() {
	if (!window.navigator.onLine) {console.log("We offline!"); return}
	title = document.getElementById('note_title').value;
	body = document.getElementById('note_body').value;
	note_req = new XMLHttpRequest();
	note_req.open("POST","https://api.pushbullet.com/v2/pushes",false);
	note_req.setRequestHeader("Authorization","Bearer "+localStorage.getItem("token"));
	note_req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	var blob = '{"type": "note", "title": "'+title+'", "body": "'+body+'"}';
	note_req.send(blob);
	console.log(note_req);
}

function sendLinkRQ(){
	if (!window.navigator.onLine) {console.log("We offline!"); return}
	title = document.getElementById('link_title').value;
	body = document.getElementById('link_body').value;
	url = document.getElementById('link_url').value;
	note_req = new XMLHttpRequest();
	note_req.open("POST","https://api.pushbullet.com/v2/pushes",false);
	note_req.setRequestHeader("Authorization","Bearer "+localStorage.getItem("token"));
	note_req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	var blob = '{"type": "link", "title": "'+title+'", "body": "'+body+'", "url": "'+url+'"}';
	note_req.send(blob);
	console.log(note_req);
}

function deletePushRQ(iden) {
	if (!window.navigator.onLine) {console.log("We offline!"); return}
	var del = new XMLHttpRequest();
	del.open("DELETE","https://api.pushbullet.com/v2/pushes/"+iden,false);
	del.setRequestHeader("Authorization","Bearer "+localStorage.getItem("token"));
	del.send();
	console.log(del);
}

function dismissRQ(iden) {
	if (!window.navigator.onLine) {console.log("We offline!"); return}
	console.log("Dismissing "+ iden );
	var dis = new XMLHttpRequest();
	dis.open("POST","https://api.pushbullet.com/v2/pushes/"+iden,false);
	dis.setRequestHeader("Authorization","Bearer "+localStorage.getItem("token"));
	dis.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	var blob = '{"dismissed": true}';
	dis.send(blob);
	console.log(dis);
}

function dismissAll(pnn){
	if (!window.navigator.onLine) {console.log("We offline!"); return}
	console.log("Dismissing all pushes");
	for (var i = 0; i < pnn.length; i++) {
		dismissRQ(pnn[i]);
	}
}

function updateDevicesRQ(){
	if (!window.navigator.onLine) {console.log("We offline!"); return}
	var device_req = new XMLHttpRequest();
	device_req.open("GET","https://api.pushbullet.com/v2/devices",true);
	device_req.setRequestHeader("Authorization","Bearer "+localStorage.getItem("token"));
	device_req.send();
	console.log(device_req);
	device_req.onload=function(){
		if (device_req.readyState == 4 && device_req.status == 200) {
			var parse_device = JSON.parse(device_req.responseText);
			for (var i = 0; i < parse_device.devices.length; i++) {
				setDeviceDB(parse_device.devices[i],updateDeviceView);
				}
		}
	}
}

function deleteDeviceRQ(iden){
	if (!window.navigator.onLine) {console.log("We offline!"); return}
	var del_dev = new XMLHttpRequest();
	del_dev.open("DELETE","https://api.pushbullet.com/v2/devices/"+iden,false);
	del_dev.setRequestHeader("Authorization","Bearer "+localStorage.getItem("token"));
	del_dev.send();
	console.log(del_dev);
}

function startWebSocket(){
	// WebSocket initialization
	if (!window.navigator.onLine) {console.log("We offline!"); return}
	if(localStorage.getItem("login") == 1 && navigator.onLine) {
		console.log( "Trying to connect websocket...");
		if (!websocket)	{websocket = new ReconnectingWebSocket('wss://stream.pushbullet.com/websocket/' +localStorage.getItem("token"));}
			else {websocket.open()}
		websocket.reconnectInterval = 5000;
		websocket.onopen = function(e) { console.log( "WebSocket opened") }
		websocket.onmessage = function(e) {
			console.log( "Get WebSocket message " + e.data);	
			var message = JSON.parse(e.data);
			if (message.type  == "tickle" &&  message.subtype == "push") {
			console.log( "There is pushes update on server");
			updatePushesRQ(localStorage.getItem("last_modified"));
        		}
			if (message.type  == "tickle" &&  message.subtype == "device") {
			console.log( "There is devices update on server");
			updateDevicesRQ();
        		}
			
		}
	    websocket.onerror = function(e) { console.log( "WebSocket error"); }
    	websocket.onclose = function(e) { console.log( "WebSocket closed"); setAlarm(defAlarmDelayClose);}
	}
}
