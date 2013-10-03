requirejs.config({
	baseUrl: '/scripts', 
	paths: {
		'jquery': '../components/jquery/jquery.min',
		'underscore': '../components/underscore/underscore-min'
	},
	shim: {
		underscore: {
			exports: '_'
		}
	}
});

requirejs(['./app'], function(app) {
	
});