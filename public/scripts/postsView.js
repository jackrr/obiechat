define(['jquery', 'underscore', './notificationController', 'jquery.autosize'], function($, _, notificationControl) {
	var $warnRing;

	function notification(message) {
		var $notification = $(message);
		$('#notifications').append($notification);
		notificationControl.initialize($notification);
	}

	function updateCount(data) {
		$('#'+data.id + ' .warnCount').html(data.count);
	}

	function warnInteracts(warnsHTML) {
		var $warns = $(warnsHTML);
		$warnRing.append($warns);

		$warns.children('.close').click(function(e) {
			$(this).parent().remove();
		});

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

			if (!$(this).hasClass('fake')) {
				$.get($(this).attr('href'), function(res) {
					if (res.error) return notification(res.error);
					$self.html('');
					updateCount(res);
				});
			}
		});

		$warns.find('.deny').click(function(e) {
			e.preventDefault();
			var $self = $(this);

			if (!$(this).hasClass('fake')) {
				$.get($(this).attr('href'), function(res) {
					if (res.error) return notification(res.error);
					$self.html('');
					updateCount(res);
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
				updateCount(res);
			});
		});

		$('textarea').autosize();
	}

	function handleWarns() {
		console.log('handling warns');
		$('.warnArea .warnLink').click(function(e) {
			e.preventDefault();

			$.get($(this).attr('href'), function(res) {
				if (res.error) return notification(res.error);
				if (res.warnConfirms) return warnInteracts(res.warnConfirms);
				if (res.warnForm) return warnForm(res.warnForm);
			});
		});
	}

	function initialize() {
		$warnRing = $('#warnRing');
		handleWarns();
	}

	return {
		initialize: initialize,
		handleWarns: handleWarns
	};
});