/*

	Author: {Duts} - Robert Haladut

*/

var pushesIsUpdating = false;

if (!(localStorage.getItem("login")) || (localStorage.getItem("login") == 0)) {

//Access
var token = prompt("Type the your token for login");
localStorage.setItem("token",token);
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
	alert(parse_login.error.message);
}

}

if(localStorage.getItem("login") != 1){
	if (!confirm("Try again?")) {
		alert("You're redirected to your pushbullet account, copy the token and try again");
		window.location.replace("https://www.pushbullet.com/account");
	}else{
		window.location.reload();
	}
}

function updatePushView(push,prevPush){
	if (!push.active) {
		if (document.getElementById(push.iden)) { document.getElementById(push.iden).remove(); return}
			else {return}
		}
	if (document.getElementById(push.iden)) { var kid = document.getElementById(push.iden); var newPush = false;}
		else { var kid = document.createElement("div"); kid.id = push.iden;  var newPush = true;}

	kid.setAttribute("class","push_container_style");
	var type = push.type;
	switch (type) {
		case "note": {
				if (push.title == undefined || push.title == null) {
					kid.innerHTML = "<img src='images/note_image.png' class='im' /><h2>"+push.sender_name+"</h2><p>"+push.body+"</p>";
				}else{
					kid.innerHTML = "<img src='images/note_image.png' class='im' /><h2>"+push.sender_name+"</h2><h3>"+push.title+"</h3><p>"+push.body+"</p>";
					}
				break
				}
		case "link": {
				if (push.body == undefined || push.body == null) {
					var body_link =	"<p><a href='"+push.url+"'>"+push.url+"</a></p>";
				}else{
					var body_link =	"<p>"+push.body+"<br /><a href='"+push.url+"'>"+push.url+"</a></p>";
				}
				if (push.title == undefined || push.title == null) {
					kid.innerHTML = "<img src='images/link_image.png' class='im' /><h2>"+push.sender_name+"</h2>"+body_link;
				}else{
					kid.innerHTML = "<img src='images/link_image.png' class='im' /><h2>"+push.sender_name+"</h2><h3>"+push.title+"</h3>"+body_link;
				}
				break
				}
		case "address":{
				kid.innerHTML = "<img src='images/address_image.png' class='im' /><span>&nbsp; Address: "+ push.name +"</span>";
				break
				}
		case "file": {
				if (push.file_type == "image/png" || push.file_type == "image/jpg" || push.file_type == "image/jpeg" || push.file_type == "image/gif" || push.file_type == "image/bpm") {
					kid.innerHTML = "<img src='" + localStorage.getItem("avatar") + "' class='im' /><p><a href='" + push.file_url + "' ><img src='" + push.file_url + "' class='im_push'></a></p>";
				}else{
					kid.innerHTML = "<img src='" + localStorage.getItem("avatar") + "' class='im' /><p><a href='" + push.file_url + "' >" + push.file_name + "</a></p>";
				}
			break
			}
	} //switch		


	var trash = document.createElement("img");
	trash.setAttribute("src","images/trash.png");
	trash.setAttribute("class","trash");
	trash.addEventListener("click", deletePush, false);
	kid.appendChild(trash);
	
	
	if (newPush) {
			if (prevPush) {
				var PrevPushElem = document.getElementById(prevPush.iden);
				document.getElementById("push_container").insertBefore(kid, PrevPushElem);
					}
				else {document.getElementById("push_container").appendChild(kid)};
		}
	
}

function deletePush(e){
	if (confirm("Would you really delete this push?")){
		var iden = this.parentNode.id;
		console.log("Deleting push: " + iden);
		del(iden);
//		delPush(iden);
//		this.parentNode.remove();
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
			sequentialSetPushes(parse_push.pushes, updatePushView, function(){
				for (var i = 0; i < parse_push.pushes.length; i++) {
					//setPush(parse_push.pushes[i], updatePushView);
					//updatePushView(parse_push.pushes[i])
					if (parse_push.pushes[i].modified) {
						if (localStorage.getItem("last_modified") < parse_push.pushes[i].modified) { localStorage.setItem("last_modified",parse_push.pushes[i].modified); }
						}
					}
				getNotDismissedPushes(showNotification);
			});
		}else if(push_request.status == 400 || push_request.status == 401 || push_request.status == 403 || push_request.status == 404){
			alert(parse_push.error.message);
		}
		pushesIsUpdating = false;
	}

}

updatePushes(localStorage.getItem("last_modified"));


function loadPushes(){
	ListPushes(localStorage.getItem("last_modified"), 25, function (e){
		updatePushView(e);
	});
}

loadPushes();


function scroller(evt){
	var wrap = document.getElementById("push_container");
	var contentHeight = wrap.offsetHeight;
	var yOffset = window.pageYOffset; 
	var y = yOffset + window.innerHeight;
	if(y >= contentHeight) {
		var lastPush = document.getElementById("push_container").lastChild;
			getPush(lastPush.id,function(e){
				getFirstCreatedPush(function(fe){
					if (fe.created < e.created) {
						if (!pushesIsUpdating) {
						console.log("List more 25 pushes from DB");
						ListPushes(e.created, 25, function (e){
							updatePushView(e);
						});}
					}
						else {
							console.log("Pushes run out in DB ...");
							if (localStorage.getItem("server_cursor")) {
								if (!pushesIsUpdating) {
								console.log("Ask for load more pushes...");
								updatePushes(0);
								console.log("Pushes loaded from server.");
								}
							}
							else {console.log("and run out on server.");}
						}
				});
			});
		}
}


//Set value for hide/show menu
localStorage.setItem("a","0");

function show_note(){
	if (localStorage.getItem("a") == 0){
	document.getElementById('notes').style = "display: block;";
	localStorage.setItem("a","1");
	}else{
		document.getElementById('notes').style = "display: none;"
		localStorage.setItem("a","0");
	}
}

function show_link(){
	if (localStorage.getItem("a") == 0){
		document.getElementById('links').style = "display: block;";
		localStorage.setItem("a","1");
	}else{
		document.getElementById('links').style = "display: none;"
		localStorage.setItem("a","0");
	}
}

function note () {
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


function link(){
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

function del(iden) {
	var del = new XMLHttpRequest();
	del.open("DELETE","https://api.pushbullet.com/v2/pushes/"+iden,false);
	del.setRequestHeader("Authorization","Bearer "+localStorage.getItem("token"));
	del.send();
	console.log(del);
}

function dismiss(a) {
	console.log("Dismissing "+ a );
	var dis = new XMLHttpRequest();
	dis.open("POST","https://api.pushbullet.com/v2/pushes/"+a,false);
	dis.setRequestHeader("Authorization","Bearer "+localStorage.getItem("token"));
	dis.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	var blob = '{"dismissed": true}';
	dis.send(blob);
	console.log(dis);
}

function dismissAll(pnn){
	console.log("Dismissing all pushes");
	for (var i = 0; i < pnn.length; i++) {
		dismiss(pnn[i]);
	}
}



function logout () {
	if (websocket != null) {
        websocket.close();
    }
	localStorage.clear();
	localStorage.setItem("login","0");
	location.reload();
}

var notification;

function showNotification(pnn){
	function notiClick(){
		console.log('Notification clicked');
		navigator.mozApps.getSelf().onsuccess = function(e) { e.target.result.launch();	}
		dismissAll(pnn);
        this.close();	
		}	

	if (notification && (pnn.length == 0)) {
		console.log('Closing notification');
		notification.close();
		return
	}
	if (pnn.length == 1) {
		console.log('Creating one notification');
		getPush(pnn[0],function(e){
		console.log('Notification '+ e);
		var title = e.title;
		var options = {
			tag: "Pushbullet",
    		body: e.body,
    		icon: "images/icon64.png"
  			}
		notification = new Notification(title,options);
		notification.onclick = notiClick;
		}
		);
		console.log('Notification created');
		return
	}
	if (pnn.length > 1) {
		console.log('Creating multiple notification');
		var title = pnn.length+" new messages"
		var options = {
			tag: "Pushbullet",
    		body: "",
    		icon: "images/icon64.png"
  			}
		
		function addTitle(e){
			options.body +=  e.title + "\n";
			notification = new Notification(title,options);
			
		}
		for (var i = 0; i < pnn.length; i++) {
			getPush(pnn[i],addTitle);	
		}
		console.log('Notification created');
		return
	}	
	
}

var websocket;

window.addEventListener('online',  changeOnlineStatus);
window.addEventListener('offline', changeOfflineStatus);

function changeOnlineStatus(){
	console.log( "Go online");
	if (websocket != null) { websocket.open();}	
		else {startWebSocket();}
}  

  
function changeOfflineStatus(){
	console.log( "Go offline");
	if (websocket != null) { websocket.close(); }	
}  

startWebSocket();

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