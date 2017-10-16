module.exports = function(mysql){

	function clearOldSessions(profile, callback) {
	  var sql = 'select player_id,user_id,session from user_has_player where user_id = ? and in_play = ? and player_id <> ?';
	  var values = [profile['user_id'],1,profile['player_id']];
	  mysql.query(sql, values)
        .then(function(player){
	        console.log('Removing old sessions:', player);
	        for (var i = 0; i < player.length; i++) {
	          var profile = {user_id:profile['user_id'],player_id:player[i]['player_id']};
              var inPlayState = {in_play : 0};
              updateInPlay(profile,player[i]['session'],inPlayState, function (err, info) {
              	if(!err){
              		callback(null,info);
              	} else {
              		callback(err, null);
              	}
              });
          	}
	    })
	    .catch(function(err){
	        console.log('***** clearOldSessions.query Failed:', err.message);
	    });
	  }

	  function updateInPlay(profile,session,inPlayState, callback) {
  		var update = {in_play : inPlayState, session: session};
	    mysql.update('user_has_player', profile, update)
		        .then(function(info){
			        console.log('User in_play set to', inPlayState);
			        callback(null,info);
			    })
			    .catch(function(err){
			        console.log('***** updateInPlay.update Failed:', err.message);
			        callback(err,null);
			    });
	  }


	  function leaveTheParty(session, callback) {
	  	var sql = 'SELECT players.player_name, user_has_player.player_id,user_has_player.user_id \
					from mysys.user_has_player inner join mysys.players \
					on user_has_player.player_id = players.player_id\
					and session = ?'
		var ins = [session];
		mysql.query(sql, values)
		.then(function(player){
		    callback(null, player);
		})
		.catch(function(err){
		    console.log('***** leaveTheParty.query Failed:', err.message);
		    callback(err,null);
		});	
	  }
	  console.log('loaded session_management.js');
}