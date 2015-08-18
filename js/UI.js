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