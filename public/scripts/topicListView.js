define(['jquery', 'underscore', 'window'], function($, _, window) {
	var page, $previews;

	function watchTopicPreviewsForClicks() {
		$('.topicPreview').click(function(e) {
			window.location.href = $(e.delegateTarget).find('.topicViewLink').attr('href');
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
		page = 2;
		watchTopicPreviewsForClicks();
		fillAndWatchPreviewArea();
	}

	return {
		initialize: initialize
	}
});