var notification;

function showNotification(pnn){
	function notiClick(){
		console.log('Notification clicked');
		navigator.mozApps.getSelf().onsuccess = function(e) {
			e.target.result.launch();
			}
		window.scroll(0,0);
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
		getPushDB(pnn[0],function(e){
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
			notification.onclick = notiClick;
			
		}
		for (var i = 0; i < pnn.length; i++) {
			getPushDB(pnn[i],addTitle);	
		}
		console.log('Notification created');
		return
	}	
	
}