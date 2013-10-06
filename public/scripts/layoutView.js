define(['jquery'], function($) {
	function updateOnline(count) {
		$('#usersOnline .onlineCount').html(count);
	}
	
	return {
		updateOnlineUsers: updateOnline
	};
});