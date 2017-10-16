module.exports = function(io) {
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
		require('./player_management.js')(mysql);
		require('./player_getters.js')(mysql);
		require('./player_setters.js')(mysql);
		require('./session_management.js')(mysql);
	//listeners
    io.on('connection',function(socket){  
	    //log the new user
	    console.log("A user is connected: "+socket.id);

	    require('./player_communication.js')(socket);

		socket.on('i wanna play', function (profile) {
			console.log("This user wants to play:",JSON.stringify(profile));

			clearOldSessions(profile, function (err, info) {
				if(!err){
					console.log('Cleared session ', info);
				} else {
					console.log('**** socket.on.i-wanna-play.clearOldSessions failed: ',err.message)
				}
			}); 

			updateInPlay(profile,socket.id, 1);

			getStats(profile['player_id'], function (err, stats) {
				if(!err){
					sendStats(stats,0,true);
					updateNewsFeed(stats['player_name'],'joined the party!','neutral');
				} else {
					console.log('**** socket.on.i-wanna-play failed: ',err.message);
				}
			});
		});

		socket.on('whos playing',function(profile){
			console.log('getting other players');
			getOtherPlayers(profile, function (err, otherPlayers) {
				if(!err){
					for (var i = 0; i < otherPlayers.length; i++) {
						var aPlayer = otherPlayers[i];
						console.log('found player ',aPlayer['player_name']);
						socket.emit('player joined the party',aPlayer);
					}
				} else {
					console.log('**** socket.on.whos-playing failed',err);
				}
			});

		});

		socket.on('who can I play as', function (userId) {
			getMyPlayers(userId, function (err, players) {
				console.log('Got ',players.length,' players for user ', userId);
			    socket.emit('heres your players',players);
			});
		});

		socket.on('get all players', function (userId) {
			getAllPlayers(userId,function (err, players) {
				if(!err){
					console.log(players);
			    	socket.emit('heres your players',players);
				} else {
					console.log('**** socket.on.get-all-players failed',err);
				}
				
			})
		});

		socket.on('health affected',function (data) {
			console.log('adding to health', data);
			addLE(data);
		});

		socket.on('energies affected',function (data) {
			addEnergies(data);
		});


		socket.on('get player stats', function (profile) {
			console.log('Who called this? get player stats:',profile);
		});


		socket.on('create player', function (details) {
			console.log('creating player:', details);
			var cleanedUpDetails = {
						player_name:details['player_name'],
						PE:details['PE'],
						ME:details['ME'],
						SE:details['SE'],
						PM:0,
						SM:0,
						MM:0,
						LE:100,
						img:details['img'],
						info:details['info']
					};
			createPlayer(cleanedUpDetails, details['userId'], function (err, success) {
						if(!err){
							socket.emit('created!');//tell the create page to redirect
						} else {
							console.log('**** socket.on.create-player failed',err);
						}
					}
				);
		});

		socket.on('disconnect', function () {
			console.log('User disconnect:',socket.id);
			leaveTheParty(socket.id, function (player) {
				socket.broadcast.emit('player left the party',{user_id:player['user_id'],player_id:player['player_id']});//update the feed
				updateNewsFeed(player['player_name'],'left the session!','neutral');
			});
		});

	});

}

