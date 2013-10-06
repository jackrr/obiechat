define(['jquery', 'jquery.autosize'], function($) {
	return {
		initialize: function(element) {
			$(element).children('.close').on('click', function(e) {
				$(element).remove();
			});
		}
	};
});
