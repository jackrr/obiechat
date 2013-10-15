define(['jquery'], function($) {
	function updateOnline(count) {
		var html = "";
		if (count == 1) {
			html = count + ' user online';
		} else {
			html = count + ' users online';
		}
		$('#usersOnline').html(html);
	}

	return {
		updateOnlineUsers: updateOnline
	};
});