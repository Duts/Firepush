/*

	Author: {Duts} - Robert Haladut

*/

var pushesIsUpdating = false;

function loginRQ(){
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

function deletePush(e){
	if (confirm("Would you really delete this push?")){
		var iden = this.parentNode.id;
		console.log("Deleting push: " + iden);
		deletePushRQ(iden);
		}
}

var updatePushes = function updatePushes(last_modified, f) {
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
				getNotDismissedPushesDB(showNotification);
			});
		}else if(push_request.status == 400 || push_request.status == 401 || push_request.status == 403 || push_request.status == 404){
			alert(parse_push.error.message);
		}
		pushesIsUpdating = false;
	}

}


function sendNoteRQ() {
	title = document.getElementById('note_title').value;
	body = document.getElementById('note_body').value;
	note_req = new XMLHttpRequest();
	note_req.open("POST","https://api.pushbullet.com/v2/pushes",false);
	note_req.setRequestHeader("Authorization","Bearer "+localStorage.getItem("token"));
	note_req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	var blob = '{"type": "note", "title": "'+title+'", "body": "'+body+'"}';
	note_req.send(blob);
	console.log(note_req);
	location.reload();
}

function sendLinkRQ(){
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
	location.reload();
}

function deletePushRQ(iden) {
	var del = new XMLHttpRequest();
	del.open("DELETE","https://api.pushbullet.com/v2/pushes/"+iden,false);
	del.setRequestHeader("Authorization","Bearer "+localStorage.getItem("token"));
	del.send();
	console.log(del);
}

function dismissRQ(iden) {
	console.log("Dismissing "+ a );
	var dis = new XMLHttpRequest();
	dis.open("POST","https://api.pushbullet.com/v2/pushes/"+iden,false);
	dis.setRequestHeader("Authorization","Bearer "+localStorage.getItem("token"));
	dis.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	var blob = '{"dismissed": true}';
	dis.send(blob);
	console.log(dis);
}

function dismissAll(pnn){
	console.log("Dismissing all pushes");
	for (var i = 0; i < pnn.length; i++) {
		dismissRQ(pnn[i]);
	}
}

var websocket;

function startWebSocket(){
	// WebSocket initialization
	if(localStorage.getItem("login") == 1 && navigator.onLine) {
		console.log( "Trying to connect websocket...");
		websocket = new ReconnectingWebSocket('wss://stream.pushbullet.com/websocket/' +localStorage.getItem("token"));
		websocket.reconnectInterval = 5000;
		websocket.onopen = function(e) { console.log( "WebSocket opened") }
		websocket.onmessage = function(e) {
			console.log( "Get WebSocket message " + e.data);	
			var message = JSON.parse(e.data);
			if (message.type  == "tickle" &&  message.subtype == "push") {
			console.log( "Something is updated")
			updatePushes(localStorage.getItem("last_modified"));
        		}
		}
	    websocket.onerror = function(e) { console.log( "WebSocket error") }
    	websocket.onclose = function(e) { console.log( "WebSocket closed"); }
	}
}