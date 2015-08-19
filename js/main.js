/*
The MIT License (MIT)

Copyright (c) 2015 Robert Haladut, Andrey Kunitsyn

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

if (!(localStorage.getItem("login")) || (localStorage.getItem("login") == 0)) {
	//Access
	var token = prompt("Type the your token for login");
	localStorage.setItem("token",token);
	loginRQ();
	}

if(localStorage.getItem("login") != 1){
	if (!confirm("Try again?")) {
		alert("You're redirected to your pushbullet account, copy the token and try again");
		window.location.replace("https://www.pushbullet.com/account");
	}else{
		window.location.reload();
	}
}


updatePushesRQ(localStorage.getItem("last_modified"));
updateDevicesRQ();

listPushesDB(localStorage.getItem("last_modified"), 25, updatePushView);
listDevicesDB(updateDeviceView);

window.addEventListener('scroll', scroller, false );

function scroller(evt){
	var wrap = document.getElementById("push_container");
	var contentHeight = wrap.offsetHeight;
	var yOffset = window.pageYOffset; 
	var y = yOffset + window.innerHeight;
	if(y >= contentHeight) {
		var lastPush = document.getElementById("push_container").lastChild;
			getPushDB(lastPush.id,function(e){
				getFirstCreatedPushDB(function(fe){
					if (fe.created < e.created) {
						if (!pushesIsUpdating) {
						console.log("List more 25 pushes from DB");
						listPushesDB(e.created, 25, function (e){
							updatePushView(e);
						});}
					}
						else {
							console.log("Pushes run out in DB ...");
							if (localStorage.getItem("server_cursor")) {
								if (!pushesIsUpdating) {
								console.log("Ask for load more pushes...");
								updatePushesRQ(0);
								console.log("Pushes loaded from server.");
								}
							}
							else {console.log("and run out on server.");}
						}
				});
			});
		}
	dismissVisiblePushes();
}

window.addEventListener('load', function () {
  if (window.Notification && Notification.permission !== "granted") {
    Notification.requestPermission(function (status) {
      if (Notification.permission !== status) {
        Notification.permission = status;
      }
    });
  }
}); 

//Set value for hide/show menu
localStorage.setItem("a","0");

function logout() {
	if (websocket != null) {
        websocket.close();
    }
	if (notification) {notification.close();}
	clearDB();
	localStorage.clear();
	localStorage.setItem("login","0");
	location.reload();
}


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

document.addEventListener('visibilitychange', handleVisibilityChange);

function handleVisibilityChange(){
	dismissVisiblePushes();
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
