define(['jquery', 'underscore', 'window'], function($, _, window) {
	var page, $previews, $header, $posts;

	function changeTopic(href) {
		$.get(href, function(res) {
			$posts.html(res.posts);
			$header.html(res.topicHeader);
			console.log(res);
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

	function initialize() {
		$previews = $('.topicPreviewHolder');
		$posts = $('#topicHolder .posts');
		$header = $('#topicHolder .topicHeaderContainer');
		page = 2;
		watchTopicPreviewsForClicks();
		fillAndWatchPreviewArea();
	}

	return {
		initialize: initialize
	}
});