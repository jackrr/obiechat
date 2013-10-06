
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , passport = require('passport')
  , MongoStore = require('connect-mongo')(express)
  , config = require('./config.json')
  , socketio = require('socket.io');

var app = express();

app.db = require('./db/db.js');

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({
	secret: config.secret,
	maxAge: new Date(Date.now() + config.sessionLength),
	store: new MongoStore(config.db)
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

/*
 * events
 */
var EventEmitter = require('events').EventEmitter;
var events = {};
events.topics = new EventEmitter;

/* routes */
require('./routes/index')(app);
require('./routes/post')(app);
require('./routes/topic')(app, events.topics);
require('./routes/user')(app);

var server = http.createServer(app);
var io = socketio.listen(server);

require('./sockets/socketMain')(app, io, events);

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
