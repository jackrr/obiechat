module.exports = function(app, events) {

	function error(req, res, code, msg, err) {
		if (err) console.log(err);
		if (!code) {
			code = 404;
		}
		if (!msg) {
			msg = 'Something went wrong!';
		}
		if (code == 200) {
			return res.send(msg);
		}
		res.send(code, msg);
	}

	function notifyAll(category, params) {
		app.render('partials/'+category, params, function(err, html) {
			if (err) return console.log("Failed to generate global notification!\n", err, params);
			events.emit('newNotification', {type: category, html: html});
		});
	}

	return {
		error: error,
		notifyAll: notifyAll
	};
}