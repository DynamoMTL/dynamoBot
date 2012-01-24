var _ = require('underscore');
var Campfire = require('./campfire.js').Campfire;

var marshmallow = function(config, definition) {
  var messages = {};
  var botAccountCache;
  definition({
    on: function(re, callback) {
      messages[re] = callback;
    },
    tricks: function() {
      return messages;
    },
  });
  
  var campfireInstance = new Campfire(config);
  
  _.each(config.room_ids, function(room_id) {
    console.log('Joining room ' + room_id);
    campfireInstance.room(room_id, function(room) {
      room.join(function() {
        
        room.listen(function(message) {
          if (message.type != "TextMessage"){
            return;
          }

          var match;
          for (re in messages) {
            if (re == 'catchAll') { 
              continue; 
            } else if (match = message.body.match(re)) {

              match.shift();

              campfireInstance.user(message.user_id, function(speaker) {
                messages[re].call(room, match, speaker.user);
              });

              return;
            }
          }
          if (messages['catchAll']) {
            campfireInstance.user(message.user_id, function(speaker) {
              messages['catchAll'].call(room, message, speaker.user);
            });
          }
        })
      });
    });
    
  })  
}

exports.marshmallow = marshmallow;
