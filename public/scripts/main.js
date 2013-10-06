requirejs.config({
	baseUrl: '/scripts', 
	paths: {
		'jquery': '../components/jquery/jquery.min',
		'underscore': '../components/underscore/underscore-min',
		'jquery.autosize': "../components/jquery-autosize/jquery.autosize.min",
		'io': "../components/socket.io-client/lib/io" 
	},
	shim: {
		io: {
			exports: 'io'
		},
		underscore: {
			exports: '_'
		}
	}
});

requirejs(['./app', 'io'], function(app, io) {
	
	// establish socket connection
});