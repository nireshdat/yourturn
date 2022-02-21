
function validateRequiredField() {
	unfilledElms = [];
	$(".textarea").each((i,elm) => {
		if (elm.innerText === "") {
			unfilledElms.push(elm);
		}
	})
	if ($("#user-self-image canvas").length === 0) {
		unfilledElms.push($("#user-self-image")[0]);
	}
	if ($("#user-inspiration-image canvas").length === 0) {
		unfilledElms.push($("#user-inspiration-image")[0]);
	}

	$(".textarea, .user-image canvas").each((i, elm) => {
		elm.classList.remove("invalid-flash");
	})
	setTimeout(function() {
		for (var elm of unfilledElms) {
			elm.classList.add("invalid-flash");
		}
	}, 200);
	return (unfilledElms.length === 0);
}

function placeCaretAtEnd(el) {
    if (typeof window.getSelection != "undefined"
            && typeof document.createRange != "undefined") {
        var range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (typeof document.body.createTextRange != "undefined") {
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(el);
        textRange.collapse(false);
        textRange.select();
    }
}

const magicLineHeight = 1.15;

function countLines(elm) {
	var fontSizeString = window.getComputedStyle(elm, null).getPropertyValue('font-size');
	var fontSize = parseFloat(fontSizeString);
	return Math.floor(elm.offsetHeight / (fontSize * magicLineHeight))
}


function enforceLineLimit(evt) {
	var element = evt.target;
    var rowLimit = parseInt(element.attributes.rows.value);
    var currRows = countLines(element);
    for (var i = 0; i < 50; i++) {
    	if (currRows > rowLimit) {
    		txt = element.innerText
	    	element.innerText = txt.substring(0, txt.length - 1).trim();
	    	placeCaretAtEnd(element);
	    	var currRows = countLines(element);
    	}
    	else {
    		break;
    	}
    }
}

function cleanWhiteSpace(evt) {
	var element = evt.target;
	if (element.innerText.trim() === "") {
		element.innerHTML = "";
	}
}


function textareaHandleOnInput(evt) {
	enforceLineLimit(evt);
	cleanWhiteSpace(evt);
}

function limitHeight(elm) {
	elm.oninput = textareaHandleOnInput;
}

$(".textarea").each(function(){limitHeight(this)});

function sendInspiration(name, title, description) {
	jQuery.post(
		"/sendinspiration",
		{
			"name": name,
			"title": title,
			"description": description
		}
	)
}

function takeScreenshot(){
	if (!validateRequiredField()) {
		return false;
	}
	//svgToCanvas(document.getElementById("generator"));
	name = $("#user-inspiration-name")[0].innerText;
	title = $("#user-inspiration-description")[0].innerText;
	description = $("#info .textarea")[0].innerText;
	sendInspiration(name, title, description);
	html2canvas(
		document.getElementById("generator"), 
		{allowTaint: true, scale: 10}
	).then(
		function(canvas) {
			var image = canvas.toDataURL();
			var aDownloadLink = document.createElement('a');
			aDownloadLink.download = 'your_turn.png';
			aDownloadLink.href = image;
			aDownloadLink.click();
		}
	);
	return true;
}


function startCroppie(owner){
	$container = $('#user-'+ owner + '-image');
	$img = $('#user-' + owner +'-image img');
	$button = $('button#user-' + owner + '-container-button')
	$button[0].innerText = "סיום עריכה"
	$img.hide();
	$container.attr('in-edit', "yes");
	$button.attr('in-edit', 'yes');
	$container.croppie({
		url:$img.src,
		showZoomer: false,
		enableResize:true,
		viewport:{width:"90%",height:"90%",type:'circle'},
		minZoom:1,
		enforceBoundary:false,
		boundry:{width:"100%",height:"100%"}
	});
}

function stopCroppie(owner) {
	$container = $('#user-'+ owner + '-image');
	$img = $('#user-' + owner +'-image img');
	$button = $('button#user-' + owner + '-container-button')
	$button[0].innerText = "מיקום תמונה";
	$container.croppie('result', {type:'blob'}).then(function (resp) {
		$img.src = resp;
		$('.cr-boundary, .cr-slider-wrap').remove();
		$container.croppie('destroy');
	});
	$container.attr('in-edit', "no");
	$button.attr('in-edit', 'no');
	$img.show()

}

function editorButtonClick(owner) {
	$button = $('button#user-' + owner + '-container-button');
	if ($button.attr('in-edit') === "yes") {
		stopCroppie(owner);
	}
	else {
		startCroppie(owner);
	}
}

$('button#user-inspiration-container-button').on('click', e => {editorButtonClick('inspiration')});

$('button#user-self-container-button').on('click', e => {editorButtonClick('self')});

function updateUserImage(image, container, inputElm, openEditor) {
	var ratio = 1;
	var width = container.offsetWidth;
	var height = width * ratio;
	container.onclick = (evt) => {
		evt.preventDefault();
		if (container.getAttribute('in-edit') !== "yes"){
			inputElm.click();
		}
	};
	if (image !== "") {
		loadImage(
	    	image,
		    function (img) {
		    	imgElm = document.createElement("img");
		    	imgElm.src = img.toDataURL();
				container.innerHTML = "";
		    	container.appendChild(imgElm);
		    },
		    {
		    	maxWidth: width,
		  		maxHeight: height,
		  		minWidth: width,
		  		minHeight: height,
		  		crop: true,
		  		pixelRatio: 10,
		    } // Options
		)
	}
}

function initializeUserImages() {
	userSelfImageInputElm = document.getElementById('user-self-image-input')
	userSelfImageInputElm.onchange = function () {
		container = document.getElementById('user-self-image')
		updateUserImage(this.files[0], container, userSelfImageInputElm, true);
	}

	userInspirationImageInputElm = document.getElementById('user-inspiration-image-input');
	userInspirationImageInputElm.onchange = function () {
		container = document.getElementById('user-inspiration-image')
		updateUserImage(this.files[0], container, userInspirationImageInputElm, true);
	}

	updateUserImage("", document.getElementById('user-self-image'), userSelfImageInputElm, false);
	updateUserImage("", document.getElementById('user-inspiration-image'), userInspirationImageInputElm, false);
}

initializeUserImages();

function limitTextArea(elm, limit) {
    function limitLines() {
        var l = elm.value.replace(/\r\n/g, "\n").replace(/\r/g, "").split(/\n/g);//split lines
        if (l.length > limit) {
            elm.value = l.slice(0, limit).join("\n");
        }
    }
    
    function paste() {//onpaste needs timeout
        setTimeout(limitLines, 1);
    }

    limitLines(); //Like onload

    elm.onkeyup = limitLines;
    elm.onpaste = paste;
}

function limitAllTextAreas() {
	for (let elm of document.getElementsByTagName("textarea")) {
		limitTextArea(elm, elm.rows);
	}
}
limitAllTextAreas();


function svgToCanvas(targetElem) {
    var svgElem = targetElem.getElementsByTagName("svg");
    for (const node of svgElem) {
      node.setAttribute("font-family", window.getComputedStyle(node, null).getPropertyValue("font-family"));
      node.replaceWith(node);
    }
}

svgToCanvas(document.getElementById("generator"));