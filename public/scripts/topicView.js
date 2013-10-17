define(['jquery', 'underscore', './notificationController', './postsView', 'jquery.autosize'], function($, _, notificationControl, postsView) {
	var page, slug, $postContainer, $postsAdded;

	function postsAdded() {
		$postsAdded.html('New Posts in Topic!');
		if (!($postContainer[0].scrollHeight > $postContainer.height()) || $postContainer.scrollTop() > $postContainer.height()) {
			scrollTopic('bottom');
		}
	}

	function watchTopic(slug, socket) {
		socket.emit('watchTopic', {slug: slug});

		socket.on('topicUpdated', function(data) {
			_.each(data.posts, function(post) {
				$postContainer.append(post);
				postsAdded();
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

	function loadPage(cb) {
		if (!(page < 0)) {
			$.get(slug + '/' + page, function(res) {
				if (res.error) {
					notification(res.error);
				} else {
					page--;
					$postContainer.prepend(res);
					cb();
				}
			});
		}
	}

	function getPageNum() {
		$.get('/topic/' + slug + '/pageNumber', function(res) {
			page = res.page-1;
			fillTopic();
			watchScroll();
		});
	}

	function fillTopic() {
		if ( $postContainer[0].scrollHeight < $('html').height()) {
			loadPage(function() {
				fillTopic();
			});

		} else {
			scrollTopic('bottom');
		}
	}

	function scrollTopic(pos) {
		switch (pos) {
			case 'top':
				$postContainer.scrollTop(0);
				break;
			case 'bottom':
				$postContainer.scrollTop($postContainer[0].scrollHeight);
				break;
			default:
				$postContainer.scrollTop(pos);
		}
	}

	function watchScroll() {
		$postContainer.scroll(function() {
			if ($postContainer.scrollTop() === 0) {
				var oldHeight = $postContainer[0].scrollHeight;
				loadPage(function() {
					scrollTopic($postContainer[0].scrollHeight - oldHeight);
				});
			}
			if (($postContainer.scrollTop() + $postContainer.height()) == $postContainer[0].scrollHeight) {
				$postsAdded.html('');
			}
		});
	}

	function initialize(path, socket) {
		slug = path.replace('/topic/show/', '');
		$postContainer = $('.posts');
		$postsAdded = $('.topicHeader .alerts .added');
		postsView.initialize();
		getPageNum();
		watchForm();
		watchTopic(slug, socket);
	}

	return {
		initialize: initialize
	};
});
