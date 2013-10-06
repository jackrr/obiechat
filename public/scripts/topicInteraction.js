define(['jquery', './notificationController', './socketModule','jquery.autosize'], function($, notificationControl, socketModule) {
	var socket = socketModule.socket;
	
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
		
			$('.postForm').keyup(function(e) {
				if (e && e.keyCode == 13 && !e.shiftKey) {
					$('form[name=post]').submit();
				}
			});
			
			console.log($(location));
		}
	};
});
