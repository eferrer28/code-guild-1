$(document).ready(function () {
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
	    var cookies = document.cookie.split(';');
	    for (var i = 0; i < cookies.length; i++) {
		var cookie = $.trim(cookies[i]);
		// Does this cookie string begin with the name we want?
		if (cookie.substring(0, name.length + 1) == (name + '=')) {
		    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
		    break;
		}
	    }
	}
	return cookieValue;
    }

    var csrftoken = getCookie('csrftoken');

    function csrfSafeMethod(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }

    $.ajaxSetup({
	beforeSend: function(xhr, settings) {
	    if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
	        xhr.setRequestHeader("X-CSRFToken", csrftoken);
	    }
        }
    });

    var dropDiv = document.getElementById("uploader"),
        display = document.getElementById("display"),
	acceptedTypes = {
	    "image/jpeg": true,
	    "image/png": true,
	    "image/gif": true
	};

    //modal builder
    function makeModal (url, title, size) {
	//list out child nodes of parent for assignment of title, size, image url

	//console.log(url);
	//console.log(title);
	//console.log(size);

	var modalBox = document.getElementById("trash-modal"),
	    modalParent = document.getElementById("trash-modal-content"),
            modalBody = document.getElementById("trash-modal-body"),
	    modalImg = modalBody.childNodes[3],
	    modalTitle = document.getElementById("trash-modal-title"),
	    modalSize = document.getElementById("trash-modal-size");
	
	console.log(modalImg);
	modalImg.className = "trash-modal-display";
	modalImg.src = url;
	modalTitle.innerHTML = title;
	modalSize.innerHTML = "size: " + size;
    }

    //add click handler to open modal
    display.onclick = function (ev) {
	ev = ev || window.event;
	var target = ev.target || ev.srcElement,
	    modalBody = document.getElementById("trash-modal-body"),
	    url,
	    title,
	    size;
	
	console.log(modalBody.children.length);

	if (target.className === "trash-thumbnail") {
	    var url = target.style.backgroundImage,	    
			    
	    //omfg double double quotes! die in a fucking fire.
	    //really wish I was better with regex
	    url = url.replace(url.charAt(url.length - 2), "");
	    url = url.replace(url.charAt(3), "");
	    url = url.substring(3, url.length - 2);
	   
	    title = target.title;
	    size = target.dataset.size;	

	    console.log(target);

	    if (modalBody.children.length === 1) {	    
		makeModal(url, title, size);
	    }
	}
    }


    //AJAX POST request handler for dropped files
    function upload (files) {
	var formData = new FormData(),
	    xhr = new XMLHttpRequest(),
	    max = files.length,
	    i;

        //loop through the files array and send each file individually
	for (i = 0; i < max; i++) {
	    //check for acepted picture file type
	    if (acceptedTypes[files[i].type]) {
		formData.append("file_" + i, files[i]);
	    }
	}			
        sendFile(formData);

	function sendFile (file) {
            xhr.open("post", "upload/");
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
            xhr.send(formData);
	    xhr.onreadystatechange = function () {
	        if ((xhr.readyState === 4) && (xhr.status === 200)) {
		    //callback function for handling the server response contained in data
                    xhr.onload = showThumbnails (xhr.response) 
	        }
            }
        }
    }

    //AJAX callback handler	
    function showThumbnails (data) {
	var response = JSON.parse(data),
	    div = document.createElement("div"),
	    msg = document.createElement("h3"),
	    max = response.length,
	    i;
	
	//add header to thumbnails
	if (display.firstElementChild === null) {
	    msg.innerHTML = "click on a preview to edit";
	    display.appendChild(msg);
	    msg.className = "trash-preview-header";	
	}

	//maybe use DocumentFragment here for offline maniputlation
	//then stuff the finished fragment into the DOM?
	for (i = 0; i < max; i++) {
	    var div = document.createElement("div"),
		backgroundImg = response[i].file.url;
    
	    div.id = "thumbnail-" + i;
	    div.className = "trash-thumbnail";
	    div.setAttribute("data-size", response[i].file.size);
	    div.title = response[i].file.name;
	    div.setAttribute("data-toggle", "modal");
	    div.setAttribute("data-target", "#trash-modal");
	    div.style.backgroundImage = "url(" + backgroundImg + ")";
	    display.appendChild(div);
	}
    }

    dropDiv.ondrop = function (ev) {
	var max = ev.dataTransfer.files.length,
	    i;

	ev.preventDefault();
	ev.stopPropagation();
	//return to base css class after dropping
	this.className = "trash-uploader";
	upload(ev.dataTransfer.files);
     }

     //add visual feedback during dragging
     dropDiv.ondragover = function () {
        this.className = "trash-uploader dragover";
	return false;
     }

     //return to base css class
     dropDiv.ondragleave = function () {
	this.className = "trash-uploader";
	return false;
     }
});
