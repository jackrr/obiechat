define(['jquery', 'underscore', './notificationController', 'jquery.autosize'], function($, _, notificationControl) {
	var page, slug, morePages = true;

	function watchTopic(slug, socket) {
		socket.emit('watchTopic', {slug: slug});

		socket.on('topicUpdated', function(data) {
			_.each(data.posts, function(post) {
				$('.posts').append(post);
				scrollTopic('bottom');
			});
		});

		socket.on('topicViewerCount', function(data) {
			$('.currentViewers .count').html(data.count);
		});

		$(window).unload(function() {
			socket.emit('stopWatchingTopic', {slug: slug});
		});
	}

	function notification(message) {
		var $notification = $(message);
		$('#notifications').append($notification);
		notificationControl.initialize($notification);
	}

	function watchForm() {
		$('form[name=post]').submit(function(e) {
			e.preventDefault();

			$.post($(this).attr('action'), $(this).serialize(), function(res) {
				if (res.error) {
					notification(res.error);
				} else {
					$(e.target).find('textarea').val("");
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

	function loadPage() {
		$.get(slug + '/' + page, function(res) {
			if (res.error) {
				notification(res.error);
			} else {
				$('.posts').prepend(res);
				scrollTopic('bottom');
			}
		});
	}

	function getPageNum() {
		$.get('/topic/' + slug + '/pageNumber', function(res) {
			page = res.page-1;
			fillTopic();
		});
	}

	function fillTopic() {
		var $posts = $('.posts')[0];
		if ( $posts.scrollHeight < $('html').height()) {
			loadPage();
			page--;
		} else {
			scrollTopic('bottom');
		}
	}

	function scrollTopic(pos) {
		switch (pos) {
			case 'top':
				$('.posts').scrollTop(0);
				break;
			case 'bottom':
				$('.posts').scrollTop($('.posts')[0].scrollHeight);
				break;
			default:
				$('.posts').scrollTop(pos);
		}
	}

	function initialize(path, socket) {
		console.log('initializing topicView');
		slug = path.replace('/topic/show/', '');
		getPageNum();
		watchForm();
		watchTopic(slug, socket);
	}

	return {
		initialize: initialize
	};
});
