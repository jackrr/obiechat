define(['jquery', 'underscore', './notificationController', 'jquery.autosize'], function($, _, notificationControl) {
	
	function watchTopic(slug, socket) {
		socket.emit('watchTopic', {slug: slug});
		
		socket.on('topicUpdated', function(data) {
			_.each(data.posts, function(post) {
				$('.posts').append(post);
			});
		});
		
		$(window).unload(function() {
			socket.emit('stopWatchingTopic', {slug: slug});
		});
	}
	
	function watchForm() {
		$('form[name=post]').submit(function(e) {
			e.preventDefault();

			$.post($(this).attr('action'), $(this).serialize(), function(res) {
				if (res.error) {
					var $notification = $(res.error);
					$('#notifications').append($notification);
					notificationControl.initialize($notification);
				} else {
					$(e.target).find('textarea').val("");
					// $('.posts').append(res);
				}
			});
		});
		
		$('.postForm').keyup(function(e) {
			if (e && e.keyCode == 13 && !e.shiftKey) {
				$('form[name=post]').submit();
			}
		});
		
		$('textarea').autosize();
	}
	
	function initialize(path, socket) {
		slug = path.replace('/topic/show/', '');
		watchForm();
		watchTopic(slug, socket);
	}
	
	return { 
		initialize: initialize
	};
});
