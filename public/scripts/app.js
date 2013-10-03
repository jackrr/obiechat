define(['jquery'], function($) {
	$('form[name=post]').submit(function(e) {
		e.preventDefault();
		
		$.post($(this).attr('action'), $(this).serialize(), function(res) {
			console.log(res);
			$('.posts').append(res);
		});
	});
});