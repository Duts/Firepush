/*

	Author: {Duts} - Robert Haladut

*/

if (localStorage.getItem("login") == 0) {

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
};


//Load all pushs
var push_request = new XMLHttpRequest();
push_request.open("GET","https://api.pushbullet.com/v2/pushes",true);
push_request.setRequestHeader("Authorization","Bearer "+localStorage.getItem("token"));
push_request.send();
console.log(push_request);

//Contain all iden
var iden = [];

push_request.onreadystatechange=function()
{
	if (push_request.readyState == 4 && push_request.status == 200) {
		var parse_push = JSON.parse(push_request.responseText);
		for (var i = 0; i < parse_push.pushes.length; i++) {
		 	var kid = document.createElement("div");
		 	kid.setAttribute("class","push_container_style");
		    var type = parse_push.pushes[i].type;
		    iden[i] = parse_push.pushes[i].iden;

			if (type == "note") {
				if (parse_push.pushes[i].title == undefined || parse_push.pushes[i].title == null) {
					kid.innerHTML = "<img src='images/note_image.png' class='im' />"+"<p>"+parse_push.pushes[i].body+"</p>";
				}else{
					kid.innerHTML = "<img src='images/note_image.png' class='im' /><span>&nbsp;"+parse_push.pushes[i].title+"</span><p>"+parse_push.pushes[i].body+"</p>";
				}
			}else if (type == "link") {
				if (parse_push.pushes[i].body == undefined || parse_push.pushes[i].body == null) {
					var body_link =	"<p><a href='"+parse_push.pushes[i].url+"'>"+parse_push.pushes[i].url+"</a></p>";
				}else{
					var body_link =	"<p>"+parse_push.pushes[i].body+"<br /><a href='"+parse_push.pushes[i].url+"'>"+parse_push.pushes[i].url+"</a></p>";
				}
				if (parse_push.pushes[i].title == undefined || parse_push.pushes[i].title == null) {
					kid.innerHTML = "<img src='images/link_image.png' class='im' />"+body_link;
				}else{
					kid.innerHTML = "<img src='images/link_image.png' class='im' /><span>&nbsp;"+parse_push.pushes[i].title+"</span>"+body_link;
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
			if (parse_push.pushes[i].active == true) {
			 	var trash = document.createElement("img");
			 	trash.setAttribute("src","images/trash.png");
			 	trash.setAttribute("class","trash");
			 	trash.setAttribute("title",i);
			 	trash.setAttribute("onclick","del("+i+")");
				document.getElementById("push_container").appendChild(trash);
		 	}

			document.getElementById("push_container").appendChild(kid);
		}
	}else if(push_request.status == 400 || push_request.status == 401 || push_request.status == 403 || push_request.status == 404){
		alert(parse_push.error.message);
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

function logout () {
	localStorage.clear();
	localStorage.setItem("login","0");
}