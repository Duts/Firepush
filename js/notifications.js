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

var notification;

function showNotification(pnn){
	function notiClick(){
		console.log('Notification clicked');
		navigator.mozApps.getSelf().onsuccess = function(e) {
			e.target.result.launch();
			}
		window.scroll(0,0);
		//dismissAll(pnn);
        //this.close();	
		}	

	if (notification && (pnn.length == 0)) {
		console.log('Closing notification');
		notification.close();
		return
	}
	if (pnn.length == 1) {
		console.log('Creating one notification');
		getPushDB(pnn[0],function(e){
		console.log('Notification '+ e);
		var title = e.title ? e.title : "";
		var options = {
			tag: "Pushbullet",
			body: e.body ? e.body : "",
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
			options.body +=  (e.title ? e.title: "") + "\n";
			notification = new Notification(title,options);
			notification.onclick = notiClick;
			
		}
		for (var i = 0; i < pnn.length; i++) {
			getPushDB(pnn[i],addTitle);	
		}
		console.log('Notification created');
		return
	}	
	
}
