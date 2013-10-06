define(['jquery', 'jquery.autosize'], function($) {
	return { 
		initialize: function() {
			$('form[name=post]').submit(function(e) {
				e.preventDefault();
			
				$.post($(this).attr('action'), $(this).serialize(), function(res) {
					if (res) {
						$(e.target).find('textarea').val("");
						$('.posts').append(res);
					}
				});
			});
		
			$('textarea').autosize();
		
			$('.postForm').keyup(function(e) {
				if (e && e.keyCode == 13 && !e.shiftKey) {
					$('form[name=post]').submit();
				}
			});
		}
	};
});
