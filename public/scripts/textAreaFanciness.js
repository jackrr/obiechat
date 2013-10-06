define(['jquery'], function($) {
	
	// found here: http://stackoverflow.com/questions/263743/how-to-get-caret-position-in-textarea
	function getCaret(el) {
		if (el.selectionStart) { 
			return el.selectionStart; 
		} else if (document.selection) { 
			el.focus(); 

			var r = document.selection.createRange(); 
			if (r == null) { 
				return 0; 
		    } 

			var re = el.createTextRange();
			rc = re.duplicate(); 
			re.moveToBookmark(r.getBookmark());
			rc.setEndPoint('EndToStart', re);
			return rc.text.length; 
		}  
		return 0; 
	}
	
	function newline(textarea) {
		var content = textarea.value;
		var caret = getCaret(textarea);
		textarea.value = content.substring(0,caret) + "\n" + content.substring(caret,content.length);
	}
	
	return {
		newline: newline
	};
});