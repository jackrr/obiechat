define(['jquery', 'jquery.autosize'], function($) {
	$('form[name=post]').submit(function(e) {
		e.preventDefault();
		
		$.post($(this).attr('action'), $(this).serialize(), function(res) {
			console.log(res);
			$('.posts').append(res);
		});
	});
	
	$('textarea').autosize();
	
	$('.postForm').keydown(function(e) {
		if (e && e.keyCode == 13) {
			$('form[name=post]').submit();
		}
	});
});