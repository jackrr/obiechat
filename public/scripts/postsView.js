define(['jquery', 'underscore', './notificationController', 'jquery.autosize'], function($, _, notificationControl) {
	var $warnRing;

	function notification(message) {
		var $notification = $(message);
		$('#notifications').append($notification);
		notificationControl.initialize($notification);
	}

	function watchPostEvents(socket) {
		socket.on('warnCountChange', function(data) {
			updateCount(data.id, data.count);
		});
	}

	function updateCount(id, count) {
		$('#' + id + ' .warnCount').html(count);
	}

	function warnInteracts(warnsHTML) {
		var $warns = $(warnsHTML);
		showWarnRing($warns);

		$warns.find('.newWarning .warnLink').click(function(e) {
			e.preventDefault();

			$.get($(this).attr('href'), function(res) {
				if (res.error) return notification(res.error);
				warnForm(res.warnForm);
			});
		});

		$warns.find('.confirm').click(function(e) {
			e.preventDefault();
			var $self = $(this);

				$.get($(this).attr('href'), function(res) {
					if (res.error) return notification(res.error);
					hideWarnRing();
				});
		});

		$warns.find('.deny').click(function(e) {
			e.preventDefault();
			var $self = $(this);
			hideWarnRing();

				// $.get($(this).attr('href'), function(res) {
				// 	if (res.error) return notification(res.error);
				// 	hideWarnRing();
				// });
		});
	}

	function showWarnRing(content) {
		$('.header').addClass('fade');
		$('.main').addClass('fade');
		$('#cover').show();

		$warnRing.html(content);
		$('#cover').click(function() {
			hideWarnRing();
		});
	}

	function hideWarnRing() {
		$warnRing.html('');
		$('#cover').hide();
		$('.header').removeClass('fade');
		$('.main').removeClass('fade');
	}

	function warnForm(warnForm) {
		var $warn = $(warnForm);

		showWarnRing($warn);

		$warn.children('form[name=warn]').submit(function(e) {
			e.preventDefault();
			var form = $(this);

			$.post($(this).attr('action'), $(this).serialize(), function(res) {
				if (res.error) return notification(res.error);
				hideWarnRing();
			});
		});

		$('textarea').autosize();
	}

	function handleWarns() {
		var warnLinkClickFunc = function(e) {
			console.log('warn link');
			e.preventDefault();

			$.get($(this).attr('href'), function(res) {
				if (res.error) return notification(res.error);
				if (res.warnConfirms) return warnInteracts(res.warnConfirms);
				if (res.warnForm) return warnForm(res.warnForm);
			});
		}
		$('.warnArea .warnLink').unbind('click', warnLinkClickFunc);
		$('.warnArea .warnLink').click(warnLinkClickFunc);
	}

	function watchNameShow() {
		function swapNames(e) {
			var unameHolder = $(e.currentTarget);
			var username = unameHolder.html();
			var realnameHolder = $(e.currentTarget).next('.authorOfficial');
			var realname = realnameHolder.html();
			realnameHolder.html(username);
			unameHolder.html(realname);
		}

		$('.postInner .author').off('mouseenter');
		$('.postInner .author').off('mouseleave');
		$('.postInner .author').on('mouseenter', swapNames);
		$('.postInner .author').on('mouseleave', swapNames);
	}

	function newPosts() {
		handleWarns();
		watchNameShow();
	}

	function initialize(socket) {
		$warnRing = $('#warnRing');
		handleWarns();
		watchNameShow();
		watchPostEvents(socket);
	}

	return {
		initialize: initialize,
		newPosts: newPosts
	};
});