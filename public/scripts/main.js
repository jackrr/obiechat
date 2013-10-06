requirejs.config({
	baseUrl: '/scripts', 
	paths: {
		'jquery': '../components/jquery/jquery.min',
		'underscore': '../components/underscore/underscore-min',
		'jquery.autosize': "../components/jquery-autosize/jquery.autosize.min",
		'io': "../components/socket.io-client/dist/socket.io.min" 
	},
	shim: {
		'io': {
			exports: 'io'
		},
		underscore: {
			exports: '_'
		}
	}
});

requirejs(['./app'], function(app) {
	
	// establish socket connection
});