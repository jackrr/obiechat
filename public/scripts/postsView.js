define(['jquery', 'underscore', './notificationController', 'jquery.autosize'], function($, _, notificationControl) {
	var $warnRing;

	function notification(message) {
		var $notification = $(message);
		$('#notifications').append($notification);
		notificationControl.initialize($notification);
	}

	function warnInteracts(warnsHTML) {
		var $warns = $(warnsHTML);
		$warnRing.append($warns);

		$warns.children('.close').click(function(e) {
			$(this).parent().remove();
		});

		$warns.find('.confirm').click(function(e) {
			console.log('clicked confirm')
			e.preventDefault();
			var $self = $(this);

			if (!$(this).hasClass('fake')) {
				$.get($(this).attr('href'), function(res) {
					if (res.error) return notification(res.error);
					$self.html(res);
				});
			}
		});

		$warns.find('.deny').click(function(e) {
			console.log('clicked deny')
			e.preventDefault();
			var $self = $(this);

			if (!$(this).hasClass('fake')) {
				$.get($(this).attr('href'), function(res) {
					if (res.error) return notification(res.error);
					$self.html(res);
				});
			}
		});
	}

	function warnForm(warnForm) {
		var $warn = $(warnForm);
		$warnRing.append($warn);
		$warn.children('form[name=warn]').submit(function(e) {
			e.preventDefault();
			var form = $(this);

			$.post($(this).attr('action'), $(this).serialize(), function(res) {
				if (res.error) return notification(res.error);
				form.parent().remove();
				warnInteracts(res);
			});
		});

		$('textarea').autosize();
	}

	function handleWarns() {
		$('.interactions .warnLink').click(function(e) {
			e.preventDefault();

			$.get($(this).attr('href'), function(res) {
				if (res.error) return notification(res.error);
				warnForm(res);
			});
		});
	}

	function initialize() {
		$warnRing = $('#warnRing');
		handleWarns();
	}

	return {
		initialize: initialize
	};
});