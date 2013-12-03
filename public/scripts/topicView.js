define(['jquery', 'underscore', './notificationController', './postsView', './window', 'jquery.autosize'], function($, _, notificationControl, postsView, window) {
	var page, slug, $postContainer, $postsAdded;

	function postsAdded() {
		$postsAdded.html('New Posts in Topic!');
		$postsAdded.click(function() {
			scrollTopic('bottom');
			$('textarea').focus();
		});
		postsView.handleWarns();
		if (($postContainer[0].scrollHeight - ($postContainer.height() + $postContainer.scrollTop())) < (5*$('.postContainer').height())) {
			scrollTopic('bottom');
		}
	}

	function watchHides(socket) {
		socket.on('hidePost', function(data) {
			$('#' + data.id).replaceWith(data.html);
		});
	}

	function unWatchTopic(a_slug, socket) {
		socket.removeAllListeners('topicViewerCount');
		socket.removeAllListeners('topicUpdated');
	}

	function watchTopic(a_slug, socket) {
		socket.emit('watchTopic', {slug: a_slug});

		socket.on('topicUpdated', function(data) {
			_.each(data.posts, function(post) {
				$postContainer.append(post);
				postsAdded();
			});
		});

		socket.on('topicViewerCount', function(data) {
			$('.currentViewers .count').html(data.count);
		});
	}

	function notification(message) {
		notificationControl.newError(message);
	}

	function unWatchForm() {
		$('form[name=post]').unbind('submit');
		$('.postForm').unbind('keyup');
	}

	function watchForm() {
		$('form[name=post]').submit(function(e) {
			e.preventDefault();

			$.post($(this).attr('action'), $(this).serialize(), function(res) {
				if (res.empty) {
					$(e.target).find('textarea').val("");
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
			$.get('/topic/show/' + slug + '/' + page, function(res) {
				if (res.error) {
					notification(res.error);
				} else {
					page--;
					$postContainer.prepend(res);
					postsView.handleWarns();
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

	function unWatchScroll() {
		$postContainer.unbind('scroll');
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
				$postsAdded.unbind('click');
			}
		});
	}

	function closeLast(old_slug, socket) {
		unWatchTopic(old_slug, socket);
		unWatchForm();
		unWatchScroll();
	}

	function initialize(the_slug, socket) {
		if (slug) {
			closeLast(slug, socket);
		}
		slug = the_slug;
		window.history.pushState({slug: slug}, slug, '/topic/show/'+slug);
		$postContainer = $('.posts');
		$postsAdded = $('.topicHeader .alerts .added');
		postsView.initialize(socket);
		getPageNum();
		watchForm();
		watchTopic(slug, socket);
		watchHides(socket);
	}

	return {
		initialize: initialize
	};
});