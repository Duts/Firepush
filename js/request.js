/*

	Author: {Duts} - Robert Haladut

*/



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

//Contain all iden
var iden = [];

var updatePushes = function updatePushes(last_modified) {
	var push_request = new XMLHttpRequest();
	push_request.open("GET","https://api.pushbullet.com/v2/pushes?modified_after="+ last_modified,true);
	push_request.setRequestHeader("Authorization","Bearer "+localStorage.getItem("token"));
	push_request.send();
	console.log(push_request);
	
	il = iden.length

	push_request.onreadystatechange=function()
	{
		if (push_request.readyState == 4 && push_request.status == 200) {
			var parse_push = JSON.parse(push_request.responseText);
			console.log(push_request);
			var FirstPush = document.getElementById("push_container").firstChild
			for (var i = 0; i < parse_push.pushes.length; i++) {
				var newPush = false;
				if (document.getElementById(parse_push.pushes[i].iden)) { var kid = document.getElementById(parse_push.pushes[i].iden) }
					else { var kid = document.createElement("div"); kid.id = parse_push.pushes[i].iden;  newPush = true}
				kid.setAttribute("class","push_container_style");
				var type = parse_push.pushes[i].type;
				iden[il+i] = parse_push.pushes[i].iden;
				showNotification = (parse_push.pushes[i].active && !(parse_push.pushes[i].dismissed))
				if (type == "note") {
					if (parse_push.pushes[i].title == undefined || parse_push.pushes[i].title == null) {
						kid.innerHTML = "<img src='images/note_image.png' class='im' /><h2>"+parse_push.pushes[i].sender_name+"</h2><p>"+parse_push.pushes[i].body+"</p>";
						if (showNotification) {createNotification("",parse_push.pushes[i].body,il+i);}
					}else{
						kid.innerHTML = "<img src='images/note_image.png' class='im' /><h2>"+parse_push.pushes[i].sender_name+"</h2><h3>"+parse_push.pushes[i].title+"</h3><p>"+parse_push.pushes[i].body+"</p>";
						if (showNotification) {createNotification(parse_push.pushes[i].title,parse_push.pushes[i].body,il+i);}
					}
				}else if (type == "link") {
					if (parse_push.pushes[i].body == undefined || parse_push.pushes[i].body == null) {
						var body_link =	"<p><a href='"+parse_push.pushes[i].url+"'>"+parse_push.pushes[i].url+"</a></p>";
					}else{
						var body_link =	"<p>"+parse_push.pushes[i].body+"<br /><a href='"+parse_push.pushes[i].url+"'>"+parse_push.pushes[i].url+"</a></p>";
					}
					if (parse_push.pushes[i].title == undefined || parse_push.pushes[i].title == null) {
						kid.innerHTML = "<img src='images/link_image.png' class='im' /><h2>"+parse_push.pushes[i].sender_name+"</h2>"+body_link;
						if (showNotification) {createNotification("",body_link,il+i);}
					}else{
						kid.innerHTML = "<img src='images/link_image.png' class='im' /><h2>"+parse_push.pushes[i].sender_name+"</h2><h3>"+parse_push.pushes[i].title+"</h3>"+body_link;
						if (showNotification) {createNotification(parse_push.pushes[i].title,body_link,il+i);}
					}

				}else if (type == "address"){
					kid.innerHTML = "<img src='images/address_image.png' class='im' /><span>&nbsp; Address: "+ parse_push.pushes[i].name +"</span>";

				}else if (type == "file") {
					if (parse_push.pushes[i].file_type == "image/png" || parse_push.pushes[i].file_type == "image/jpg" || parse_push.pushes[i].file_type == "image/jpeg" || parse_push.pushes[i].file_type == "image/gif" || parse_push.pushes[i].file_type == "image/bpm") {
						kid.innerHTML = "<img src='" + localStorage.getItem("avatar") + "' class='im' /><p><a href='" + parse_push.pushes[i].file_url + "' ><img src='" + parse_push.pushes[i].file_url + "' class='im_push'></a></p>";
					}else{
						kid.innerHTML = "<img src='" + localStorage.getItem("avatar") + "' class='im' /><p><a href='" + parse_push.pushes[i].file_url + "' >" + parse_push.pushes[i].file_name + "</a></p>";
					}
				}

				//Check if a push is active or not
				// Disabled until works correctly with update
				//if (parse_push.pushes[i].active == true) {
				//	var trash = document.createElement("img");
				//	trash.setAttribute("src","images/trash.png");
				//	trash.setAttribute("class","trash");
				//	trash.setAttribute("title",i);
				//	trash.setAttribute("onclick","del("+i+")");
				//	document.getElementById("push_container").appendChild(trash);
				//}
				if (parse_push.pushes[i].modified) {
					if (localStorage.getItem("last_modified") < parse_push.pushes[i].modified) { localStorage.setItem("last_modified",parse_push.pushes[i].modified); }
					}

				if (newPush) {document.getElementById("push_container").insertBefore(kid, FirstPush);}
			}
		}else if(push_request.status == 400 || push_request.status == 401 || push_request.status == 403 || push_request.status == 404){
			alert(parse_push.error.message);
		}
	}

}

updatePushes(0)


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

function del(a) {
	if (confirm("Would you really delete this push?")){
		var del = new XMLHttpRequest();
		del.open("DELETE","https://api.pushbullet.com/v2/pushes/"+iden[a],false);
		del.setRequestHeader("Authorization","Bearer "+localStorage.getItem("token"));
		del.send();
		console.log(del);
		location.reload();
	}
}

function dismiss(a) {
	console.log("Dismissing "+ a + " iden:"+iden[a] );
	var dis = new XMLHttpRequest();
	dis.open("POST","https://api.pushbullet.com/v2/pushes/"+iden[a],false);
	dis.setRequestHeader("Authorization","Bearer "+localStorage.getItem("token"));
	dis.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	var blob = '{"dismissed": true}';
	dis.send(blob);
	console.log(dis);
}



function logout () {
	if (websocket != null) {
        websocket.close();
    }
	localStorage.clear();
	localStorage.setItem("login","0");
	location.reload();
}

// Creates a notification using our app icon and adding some actions
  var createNotification = function createNotification(title,body,pos) {
	var options = {
      		body: body,
      		icon: "images/icon64.png"
  			}
	console.log('Creating notification');
    var n = new Notification(title,options)
	// Handle notification clicks
	n.pos = pos
    n.onclick = function () {
		console.log('Notification clicked');
		navigator.mozApps.getSelf().onsuccess = function(e) { e.target.result.launch();	}
		dismiss(this.pos);
        this.close();
	    }
    console.log('Notification created');
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