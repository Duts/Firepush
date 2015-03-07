//Show-hide menu
localStorage.setItem("a","0");

//Set default value for pushes
localStorage.setItem("note_id","noshow");
localStorage.setItem("link_id","noshow");
localStorage.setItem("photo_id","noshow");

function push_visual () {
	if (localStorage.getItem("a") == 0){
		document.getElementById('push_visual_show').style = "display: absolute;";
		alert(localStorage.getItem("note_id"));
		if (localStorage.getItem("note_id") == "noshow") {
			document.getElementById('note_box_id').attr = 'checked';
			localStorage.setItem("note_id",document.getElementById('note_box_id').name);
		}		alert(localStorage.getItem("note_id"));

		if (localStorage.getItem("link_id") == "link_box") {
			document.getElementById('link_box_id').attr = 'checked';
			localStorage.setItem("link_id",document.getElementById('link_box_id').name);
		}
		if (localStorage.getItem("photo_id") == "photo_box") {
			document.getElementById('photo_box_id').attr = 'checked';
			localStorage.setItem("photo_id",document.getElementById('photo_box_id').name);
		}
		localStorage.setItem("a","1");
	}else{
		document.getElementById('push_visual_show').style = "display: none;"
		localStorage.setItem("a","0");
	}


}