var marshmallow = require('./lib/marshmallow').marshmallow;
var fs = require('fs');
var yaml = require('yaml');

var Github = [
 "http://github.com"
 ,""
 ,""
].join("/");

var users_out = {};

fs.readFile('./config.yml', 'utf-8', function(err,data){
	if(err){
		console.log('cannot find config');
		throw err;
	}

	var config = yaml.eval(data).campfire;

	marshmallow(config, function(bot){
		/* Git review script */
		bot.on('^!review (.+) (.+)', function(repo, branch, speaker){
			this.speak('http://github.com/dynamoMTL/' + repo + '/compare/' + branch);
		});

		bot.on('^!pt (.+)', function(story_id,speaker){
			this.speak("https://www.pivotaltracker.com/story/"+ story_id);
		});

		bot.on('^!gist (.+)', function(gist,speaker){
			this.speak("https://gist.github.com/" + gist);
		});

		bot.on('^!out (.*)', function(reason, speaker){
			this.speak("Have fun, " + speaker.name);
			this.campfire.announce( speaker.name + " is out : " + reason);
			return users_out[speaker.id] = reason;
		});

		bot.on('^!PING', function(){
			this.speak('PONG!');
		});

		bot.on('!review (.*)', function(branch) {
			this.speak([Github, "compare", branch].join("/"));
		});

		bot.on('^!commands', function(speaker){
				var _results = [];
				for(trick in bot.tricks()){
					if(trick != 'catchAll'){
						_results.push(trick.replace(/\^/,'').split(' ')[0]);
					}
				}

			return this.speak('I know the follow commands: ' + _results.join(', ') + ', Now command me!');
		});

		bot.on('catchAll', function(rawMessage, speaker){
			if(users_out[speaker.id]){
				this.speak("Welcome back, " + speaker.name);
				this.campfire.announce(speaker.name + " is back from: " + users_out[speaker.id]);
				return users_out[speaker.id] = null;
			}
		});
	});
});

