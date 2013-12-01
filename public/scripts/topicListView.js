define(['jquery', 'underscore', 'window', './topicView'], function($, _, window, topicView) {
	var page, $previews, $header, $posts, $formArea, socket;

	function changeTopic(href) {
		$.get(href, function(res) {
			$posts.html('');
			$posts.html(res.posts);
			$header.html(res.topicHeader);
			$formArea.html('');
			$formArea.html(res.postForm);
			topicView.initialize(res.slug, socket);
		});
	}

	function watchTopicPreviewsForClicks() {
		$('.topicViewLink').click(function(e) {
			e.preventDefault();
			changeTopic($(e.delegateTarget).attr('href')); // make listener below get called
		});

		$('.topicPreview').click(function(e) {
			changeTopic($(e.delegateTarget).find('.topicViewLink').attr('href'));
		});
	}

	function loadNextPage() {
		$.get('/topics/'+page, function(res) {
			if (res) {
				page++;
				$previews.append(res);
				watchTopicPreviewsForClicks();
			}
		});
	}

	function fillAndWatchPreviewArea() {
		$previews.scroll(function() {
			if ($previews.scrollTop() == $previews[0].scrollHeight - $previews.height()) {
				loadNextPage();
			}
		});
	}

	function initialize(the_socket) {
		$previews = $('.topicPreviewHolder');
		$posts = $('#topicHolder .posts');
		$header = $('#topicHolder .topicHeaderContainer');
		$formArea = $('.topicMain .postFormArea');
		page = 2;
		socket = the_socket;
		watchTopicPreviewsForClicks();
		fillAndWatchPreviewArea();
	}

	return {
		initialize: initialize
	}
});