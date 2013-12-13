define(['jquery', 'underscore', 'window', './topicView'], function($, _, window, topicView) {
	var page, $previews, $header, $posts, $formArea, $listToggle, $scrollContainer, socket;

	function changeTopic(href) {
		$.get(href, function(res) {
			$posts.html('');
			$posts.html(res.posts);
			$header.html(res.topicHeader);
			$formArea.html('');
			$formArea.html(res.postForm);
			$('#topicHolder').removeClass('hidden');
			topicView.initialize(res.slug, socket);
		}, 'json');
	}

	function watchTopicPreviewsForClicks() {
		$('.topicViewLink').click(function(e) {
			// navigation handled by click listener on a parent element
			e.preventDefault();
		});

		$('.topicPreview').click(function(e) {
			changeTopic($(e.delegateTarget).find('.topicViewLink').attr('href'));
		});
	}

	function loadNextPage() {
		if (page < 0) {
			return;
		}
		$.ajax({
			url: '/topics/'+page,
			type: 'get',
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				if (XMLHttpRequest.status == 404) {
					$previews.append("<div class='noTopics'>No more topics</div>");
					page = -1;
				}
			},
			success: function(res) {
				if (res) {
					page++;
					$previews.append(res);
					watchTopicPreviewsForClicks();
				}
			}
		});
	}

	function fillAndWatchPreviewArea() {
		$scrollContainer.scroll(function() {
			if ($scrollContainer.scrollTop() == $scrollContainer[0].scrollHeight - $scrollContainer.height()) {
				loadNextPage();
			}
		});
	}

	function watchToggle() {
		var $textHolder = $listToggle.find('.label');
		$listToggle.click(function() {
			$('.previewsAndCreateRegion').slideToggle(500);
			$('.topicPreviewContainer').slideToggle(400);

			if ($textHolder.hasClass('arrowsUp')) {
				$textHolder.removeClass('arrowsUp');
				$textHolder.addClass('arrowsDown');
			} else {
				$textHolder.removeClass('arrowsDown');
				$textHolder.addClass('arrowsUp');
			}
		});
	}

	function watchNav() {
		var path;
		$(window).bind('onhashchange', function() {
			path = window.location.pathname;
			if (path.match(/topic\/show\/\S*[^\/]/i) ) {
				changeTopic(path);
			}
		});
	}

	function initializeTopic(path) {
		changeTopic(path);
	}

	function initialize(the_socket) {
		$previews = $('.topicPreviewHolder');
		$posts = $('#topicHolder .posts');
		$header = $('#topicHolder .topicHeaderContainer');
		$formArea = $('.topicMain .postFormArea');
		$listToggle = $('#topicListToggle');
		$scrollContainer = $('.topicPreviewContainer');
		page = 2;
		socket = the_socket;
		watchTopicPreviewsForClicks();
		fillAndWatchPreviewArea();
		watchToggle();
		watchNav();
	}

	return {
		initialize: initialize,
		initializeTopic: initializeTopic
	}
});