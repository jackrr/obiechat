var db = require('./db/db');

var userCount = 10;
var topicCount = 30;
var postsPerTopic = 50;
var warnCount = 10;
var uniqListChars = {};

var userINFO = {
	name: {first: 'Test', last: 'User', pseudo: 'Phat'},
	email: 'testuser@test.com'
};

var topicINFO = {
	name: 'worst topic ever',
	description: 'many people used to say why oh why hey hey hey'
}

var users = [], topics = [];
var Topic = db.Topic, User = db.User, Post = db.Post;

run(function() {
	console.log('done');
	process.exit(code=0);
});

function createUsers(cb) {
	function createUser(cb2) {
		var fields = {
			name: {first: randomString('', 1), last: 'User', pseudo: randomString('', 1)},
			email: randomString('', 1) + getUniqNums('e') + '@test.com'
		}
		User.create(fields, function(err, user) {
			if (err) return cb(err);
			users.push({id: user._id, name: user.displayName});
			console.log('user ' + user.displayName + ' created');
			cb2();
		});
	}

	function controller() {
		if (users.length < userCount) {
			createUser(controller);
		} else {
			cb();
		}
	}

	controller();
}

function createTopics(cb) {
	var userIndex = 0;
	var anon = true;

	function createTopic(cb2) {
		var fields = {
			creatorID: users[userIndex].id,
			creatorName: users[userIndex].name,
			name: randomString('topic ', 6),
			description: randomString('', 20),
			anonymous: anon,
		};
		var newTopic = new Topic(fields);
		Topic.createNew(newTopic, function(err, topic) {
			if (err) return cb(err);
			topics.push({id: topic._id, slug: topic.slug});
			console.log('topic: ' + topic.slug + ' created');
			cb2();
		});
	}

	function controller() {
		if (topics.length < topicCount) {
			anon = !anon;
			userIndex = (userIndex+1)%userCount;
			createTopic(controller);
		} else {
			cb();
		}
	}

	controller();
}

function createPosts(cb) {
	var topicIndex = 0;
	var curTopicPosts = 0;
	var userIndex = 0;
	var userRot = 0;
	var usersPerTopic = topicCount/userCount;
	var slug = topics[topicIndex].slug;

	function createPost(cb2) {
		var userdex = (userRot+userIndex)%users.length;
		var fields = {
			creatorID: users[userdex].id,
			creatorName: users[userdex].name,
			body: randomString('', Math.floor(Math.random()*51))
		}
		var newPost = new Post(fields);

		Topic.addPostToTopic(slug, newPost, function(err) {
			if (err) return cb(err);
			console.log('post by: ' + newPost.creatorID + ' added to ' + slug);
			curTopicPosts++;
			cb2();
		});
	}

	function controller() {
		if (curTopicPosts < postsPerTopic) {
			userRot = (userRot+1)%usersPerTopic;
			return createPost(controller);
		} else {
			topicIndex++;
			if (topicIndex < topicCount) {
				slug = topics[topicIndex].slug;
				userRot = 0;
				curTopicPosts = 0;
				userIndex++;
				return createPost(controller);
			}
			cb();
		}
	}

	controller();
}

function begin(cb) {
	User.create(userINFO, function(err, user) {
		var firstTopic = new Topic(topicINFO);
		if (err) return cb(err);
		firstTopic.creatorID = user._id;
		firstTopic.creatorName = user.displayname;
	});
};

function run(cb) {
	//begin(function(err, users, topic) {
		createUsers(function(err) {
			if (err) {
				oops(err);
			}
			createTopics(function(err) {
				if (err) {
					oops(err);
				}
				createPosts(function(err) {
					if (err) {
						oops(err);
					}
					cb();
				});
			});
		});
	//});
}


function getUniqNums(id) {
	if (uniqListChars[id]) {
		uniqListChars[id]++;
	} else {
		uniqListChars[id] = 1
	}
	return uniqListChars[id];
}

function oops(err) {
	console.log(err);
	process.exit(1);
}

function randomString(begin, wordcount) {
	var words = ['add','advance','afraid','airplane','already','and','appear','apple','April','around','attempt','bad','bed','behind','beside','beyond','bird','blood','board','body','bread','broad','build','building','captain','child','childhood','children','cloud','cold','company','complete','condition','consider','considerable','could','crowd','cup','daily','dance','dare','dark','date','daughter','day','dead','deal','dear','December','decide','deep','degree','delight','demand','desire','destroy','device','did','die','difference','different','difficult','dig','dinner','direct','discover','dish','distance','distant','divide','do','doctor','does','dog','dollar','done','dont','door','double','end','escape','except','expect','experience','explain','feed','field','fine','food','forward','found','Friday','friend','garden','glad','God','gold','good','goodbye','group','happy','hard','head','heard','held','help','hope','hold','husband','idea','important','include','indeed','industry','inside','instead','jump','keep','kept','kind','ladder','lady','land','lead','leader','led','lord','loud','mad','made','measure','method','middle','mind','modern','Monday','mud','need','needle','old','open','opinion','order','orderly','outside','page','paid','pain','paint','pair','part','partial','party','pass','past','pay','peace','people','perfect','perhaps','period','person','picture','pick','piece','place','plain','plan','plant','play','pleasant','pleasure','please','point','poor','position','possible','pot','power','prepare','present','president','press','pretty','price','probably','problem','produce','promise','proud','prove','public','pull','pure','push','put','read','ready','record','red','reply','report','ridden','ride','road','round','sad','said','Saturday','second','seed','separate','September','shade','ship','shop','should','shoulder','side','sleep','slept','sold','sound','space','speak','special','spend','spent','spoke','spot','spread','spring','stand','step','stood','stop','student','study','succeed','sudden','Sunday','supply','suppose','surprise','third','thousand','today','told','toward','trade','trip','Tuesday','under','understand','understood','up','upon','usual','Wednesday','wide','wild','wind','window','wonder','wood','word','world','would','yard','yesterday'];
	var ret = begin;
	while (wordcount) {
		var index = Math.floor(Math.random()*words.length);
		ret = ret + words[index] + ' ';
		wordcount--;
	}
	return ret.trim();
}