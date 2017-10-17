
	var mysql     =     require('node-mysql-helper');//require("mysql");
	var mysqlOptions    =    {
		connectionLimit   :   100,
		host              :   'localhost',
		user              :   'root',
		password          :   'N1h0ng0@',
		database          :   'mysys',
		debug             :   false
	};
	mysql.connect(mysqlOptions);
	exports.myPlayers = function (userId, callback) {
		var sql = 'select players.player_id, player_name,PE,ME,SE,PM,MM,SM,LE,img,info,status \
				from players inner join user_has_player \
				on players.player_id = user_has_player.player_id \
				where user_has_player.user_id = ?';
		var values = [userId];
		mysql.query(sql,values)
		.then(function(players){
		    callback(null, players);
		})
		.catch(function(err){
		    console.log('***** socket.on.who-can-i-play-as Failed:', err.message);
		    callback(err,null);
		});
	}

	exports.session = function (profile, callback) {
    	mysql.record('user_has_player',profile)
		    .then(function(session){
		        callback(null,session['session']);
		    })
		    .catch(function(err){
		        console.log('***** getSession Failed:', err.message);
		        callback(err, null);
		    });
    }
	function getProfile(session, callback) {
		mysql.record('user_has_player',{session: session})
			.then(function(row){
				if(row){
					console.log('Session was in game');
					callback(null,{'user_id':row['user_id'],'player_id':row['player_id']});
				} else {
					console.log('not a game disconnect');
					callback(null,false);
				} 
			})
			.catch(function(err){
			    console.log('***** getProfile Failed:', err.message);
			    callback(err, null);
			});
	}

	exports.stats = function (playerId, callback) {
		mysql.record('players',{player_id:playerId})
			.then(function(player){
			    console.log('check out these stats', player);
			    callback(null,player);
			})
			.catch(function(err){
			    console.log('***** GetStats Failed:', err.message);
			    callback(err, null);
		});
	}

	exports.otherPlayers = function (profile, callback) {
		var sql = 'select players.player_id, player_name,PE,ME,SE,PM,MM,SM,LE,img,info,status \
					from players inner join user_has_player \
					on players.player_id = user_has_player.player_id \
					where user_has_player.in_play = 1 and players.player_id <> ? and user_has_player.user_id <> ?';
		var ins = [profile['player_id'],profile['user_id']];
		mysql.query(sql, ins)
		    .then(function(otherPlayers){
		    	callback(null, otherPlayers);
		        
		    })
		    .catch(function(err){
		        console.log('***** socket.on.whos-playing Failed:', err.message);
		        callback(err,null);
	    });	
	}

	exports.allPlayers = function (callback) {
		var sql = 'select players.player_id, player_name,PE,ME,SE,PM,MM,SM,LE,img,info,status,session \
					from players inner join user_has_player \
					on players.player_id = user_has_player.player_id \
					where user_has_player.in_play = 1';
		mysql.query(sql)
		    .then(function(players){
		        callback(null,players);
		    })
		    .catch(function(err){
		        console.log('***** allPlayers.query Failed:', err.message);
		        callback(err,null);
		    });
	}
	
	exports.myItems = function (profile, callback) {
		var sql = 'SELECT \
					    pi.player_id,pi.item_id,\
					    i.item_name,i.item_desc,i.mod_type,i.img,i.duration-pi.times_used as uses_remaining,\
					    i.item_type,i.consume_word,i.min_level,i.number_of_targets,count(trx_id)\
					FROM mysys.player_items pi inner join mysys.items i\
					on pi.item_id = i.item_id\
					where\
						pi.player_id = ?\
						and i.duration > pi.times_used\
					group by\
					pi.player_id,pi.item_id,\
					i.item_name,i.item_desc,i.mod_type,i.img,i.duration-pi.times_used,\
					i.item_type,i.consume_word,i.min_level,i.number_of_targets';
		var ins = [profile['player_id']];
		mysql.query(sql, ins)
		    .then(function(myItems){
		    	callback(null, myItems);
		        
		    })
		    .catch(function(err){
		        console.log('***** myItems.query Failed:', err.message);
		        callback(err,null);
	    });	
	}

	console.log('loaded player_getters');