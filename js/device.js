
if (localStorage.getItem("login") == 1) {

var device_req = new XMLHttpRequest();
device_req.open("GET","https://api.pushbullet.com/v2/devices",true);
device_req.setRequestHeader("Authorization","Bearer "+localStorage.getItem("token"));
device_req.send();
console.log(device_req);

localStorage.setItem("a","0");
localStorage.setItem("b","0");

var iden_device = [];
device_req.onload=function(){

if (device_req.readyState == 4 && device_req.status == 200) {
	var parse_device = JSON.parse(device_req.responseText);

	document.getElementById('bb').onclick=function(){
		if (localStorage.getItem("a") == 0){//Show-hide Menu
			if (localStorage.getItem("b") == 0){//Remember if all devices was already loaded
				for (var i = 0; i < parse_device.devices.length; i++) {
					if(parse_device.devices[i].active == true){
						var load_device = document.createElement("div");
						load_device.setAttribute("class","device_container_style");
						iden_device[i] = parse_device.devices[i].iden;

						if (parse_device.devices[i].type == "windows") {
							load_device.innerHTML = "<img src='images/pc.png' class='dev_img' /><h3>"+parse_device.devices[i].nickname+"</h3>";
						}else if(parse_device.devices[i].type == "android"){
							load_device.innerHTML = "<img src='images/phone.png' class='dev_img' /><h3>"+parse_device.devices[i].nickname+"</h3>";
						}else if(parse_device.devices[i].type == "firefox" || parse_device.devices[i].type == "chrome" || parse_device.devices[i].type == "safari" || parse_device.devices[i].type == "IE"){
							load_device.innerHTML = "<img src='images/browser.png' class='dev_img' /><h3>"+parse_device.devices[i].nickname+"</h3>";					
						}else{
							load_device.innerHTML = "<h3>"+parse_device.devices[i].nickname+"</h3>";
						}
						if (parse_device.devices[i].active == true) {
						var trash_device = document.createElement("img");
					 	trash_device.setAttribute("src","images/trash.png");
					 	trash_device.setAttribute("class","trash");
					 	trash_device.setAttribute("title",i);
					 	trash_device.setAttribute("onclick","del_device("+i+")");
						load_device.appendChild(trash_device);
						//document.getElementById("devices").appendChild(trash_device);
						};
					}
					document.getElementById('devices').appendChild(load_device);
				}
				localStorage.setItem("a","1");
				localStorage.setItem("b","1");
			}else{
				document.getElementById('devices').style = "display:block;";
				localStorage.setItem("a","1");
			}
		}else{
			document.getElementById('devices').style = "display:none;";
			localStorage.setItem("a","0");
		}
	}//onclick
}
}

function del_device(b){
	if (confirm("Would you really delete this Device?")){
		var del_dev = new XMLHttpRequest();
		del_dev.open("DELETE","https://api.pushbullet.com/v2/devices/"+iden_device[b],false);
		del_dev.setRequestHeader("Authorization","Bearer "+localStorage.getItem("token"));
		del_dev.send();
		console.log(del_dev);
		location.reload();

	}
}

}//Access


