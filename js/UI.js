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
				kid.innerHTML = "<img src='images/note_image.png' class='im' /><h2>"+push.sender_name+"</h2><h3>"+(push.title ? push.title : "")+"</h3><p>"+(push.body ? push.body : "") +"</p>";
				break
				}
		case "link": {
				var body_link =	"<p>"+(push.body ? push.body : "")+"<br /><a href='"+push.url+"'>"+push.url+"</a></p>";
				kid.innerHTML = "<img src='images/link_image.png' class='im' /><h2>"+push.sender_name+"</h2><h3>"+(push.title ? push.title : "")+"</h3>"+body_link;
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

function updateDeviceView(device){
	if (!device.active) {
		if (document.getElementById(device.iden)) { document.getElementById(device.iden).remove(); return}
			else {return}
		}
	if (document.getElementById(device.iden)) { var dev = document.getElementById(device.iden); var newDevice = false;}
		else { var dev = document.createElement("div"); dev.id = device.iden;  var newDevice = true;}
	dev.setAttribute("class","device_container_style");
	var type = device.type;
	switch (type) {
		case "windows":{
			dev.innerHTML = "<img src='images/pc.png' class='dev_img' /><h3>"+device.nickname+"</h3>";
			break;
					   }
		case "android":{
			dev.innerHTML = "<img src='images/phone.png' class='dev_img' /><h3>"+device.nickname+"</h3>";
			break;
					   }
		case "IE":
		case "chrome":
		case "safari":
		case "firefox":{
			dev.innerHTML = "<img src='images/browser.png' class='dev_img' /><h3>"+device.nickname+"</h3>";
			break;
					   }
		default: 	   {
			dev.innerHTML = "<h3>"+device.nickname+"</h3>";
			break;
					   }
	} //switch
	var trash_device = document.createElement("img");
	trash_device.setAttribute("src","images/trash.png");
	trash_device.setAttribute("class","trash");
	trash_device.addEventListener("click", deleteDevice, false);
	dev.appendChild(trash_device);
	if (newDevice) {
		document.getElementById("devices_container").appendChild(dev);
		}
	
}

function show_devices(){
	if (localStorage.getItem("a") == 0){
	document.getElementById('devices_container').style = "display: block;";
	localStorage.setItem("a","1");
	}else{
		document.getElementById('devices_container').style = "display: none;"
		localStorage.setItem("a","0");
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

function deletePush(e){
	if (confirm("Would you really delete this push?")){
		var iden = this.parentNode.id;
		console.log("Deleting push: " + iden);
		deletePushRQ(iden);
		}
}

function deleteDevice(e){
	if (confirm("Would you really delete this device?")){
		var iden = this.parentNode.id;
		console.log("Deleting device: " + iden);
		deleteDeviceRQ(iden);
		}
}

function dismissVisiblePushes(){
	if (!document.hidden){
	for (var i = 0; i < notDismissedPushes.length; i++) {
		var pushTop    = document.getElementById(notDismissedPushes[i]).getBoundingClientRect().top,
       		pushBottom = document.getElementById(notDismissedPushes[i]).getBoundingClientRect().bottom;
		if (pushTop >= 0 && pushBottom <= window.innerHeight) {
			console.log( "The push "+notDismissedPushes[i]+" is visible, dismissing it." );
			dismissRQ(notDismissedPushes[i])}
		}
	}
}
