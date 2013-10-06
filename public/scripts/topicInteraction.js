define(['jquery', './notificationController','jquery.autosize'], function($, notificationControl) {
	return { 
		initialize: function() {
			$('form[name=post]').submit(function(e) {
				e.preventDefault();
			
				$.post($(this).attr('action'), $(this).serialize(), function(res) {
					if (res.error) {
						var $notification = $(res.error);
						$('#notifications').append($notification);
						notificationControl.initialize($notification);
					} else {
						$(e.target).find('textarea').val("");
						$('.posts').append(res);
					}
				});
			});
		
			$('textarea').autosize();
		
			$('.postForm').keydown(function(e) {
				if (e && e.keyCode == 13) {
					$('form[name=post]').submit();
				}
			});
		}
	};
});
