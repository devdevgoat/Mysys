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

	//listeners
    io.on('connection',function(socket){  
	    //log the new user
	    console.log("A user is connected: "+socket.id);
	    
	    socket.on('i wanna play', function (profile) {

	    	console.log("This user wants to play:",JSON.stringify(profile));
	    	//cleanup any old sessions
	    	clearOldSessions(profile); //need to remove any players from parties of open sessions 
	    	//set player as in play
	     	updateInPlay(profile,1);
	     	//get stats
			getStats(profile['player_id'], function (err, stats) {
				if(err){
					console.log('**** socket.on.i-wanna-play failed: ',err.message)
				} else {
					
					joinTheParty(stats);
					
				}
			});
			
		});

		socket.on('whos playing',function(profile){
			console.log('getting other players');
			var sql = 'select players.player_id, player_name,PE,ME,SE,PM,MM,SM,LE,img,info,status \
						from players inner join user_has_player \
						on players.player_id = user_has_player.player_id \
						where user_has_player.in_play = 1 and players.player_id <> ? and user_has_player.user_id <> ?';
			var ins = [profile['player_id'],profile['user_id']];
        	mysql.query(sql, ins)
			    .then(function(otherPlayers){
			         for (var i = 0; i < otherPlayers.length; i++) {
		                  var aPlayer = otherPlayers[i];
		                  console.log('found player ',aPlayer['player_name']);
		                  socket.emit('player joined the party',aPlayer);
		              }
			    })
			    .catch(function(err){
			        console.log('***** socket.on.whos-playing Failed:', err.message);
			    });
		});

	    socket.on('who can I play as', function (userId) {
	    	var sql = 'select players.player_id, player_name,PE,ME,SE,PM,MM,SM,LE,img,info,status \
						from players inner join user_has_player \
						on players.player_id = user_has_player.player_id \
						where user_has_player.user_id = ?';
	    	var values = [userId];
	    	mysql.query(sql,values)
			    .then(function(players){
			        console.log(players);
			        socket.emit('heres your players',players);
			    })
			    .catch(function(err){
			        console.log('***** socket.on.who-can-i-play-as Failed:', err.message);
			    });
      		
	    });

	     socket.on('get all players', function (userId) {
	    	var sql = 'select players.player_id, player_name,PE,ME,SE,PM,MM,SM,LE,img,info,status,session \
						from players inner join user_has_player \
						on players.player_id = user_has_player.player_id \
						where user_has_player.in_play = 1';
	    	var values = [userId];
	    	mysql.query(sql,values)
			    .then(function(players){
			        console.log(players);
			        socket.emit('heres your players',players);
			    })
			    .catch(function(err){
			        console.log('***** socket.on.get-all-players Failed:', err.message);
			    });
      		
	    });

	    socket.on('health affected',function (data) {
	    	console.log('adding to health', data);
	    	addLE(data);
	    });

	     socket.on('energies affected',function (data) {
	    	addEnergies(data);
	    });


	    socket.on('get player stats', function (profile) {
	    	
	    });


	    socket.on('create player', function (details) {
	    	createPlayer({
	    		player_name:details['player_name'],
	    		PE:details['PE'],ME:details['ME'],SE:details['SE'],
	    		PM:0,SM:0,MM:0,
	    		LE:100,
	    		img:details['img'],
	    		info:details['info']
	    	},details['userId']);
	    	
	    });


	  function clearOldSessions(profile) {
	  		  var sql = 'select player_id,user_id from user_has_player where user_id = ? and in_play = ? and player_id <> ?';
			  var values = [profile['user_id'],1,profile['player_id']];
			   mysql.query(sql, values)
			        .then(function(player){
				        console.log('Removing old sessions:', player);
				        for (var i = 0; i < player.length; i++) {
				          var filter = {user_id:profile['user_id'],player_id:player[i]['player_id']};
		                  var update = {in_play : 0};
		                  mysql.update('user_has_player', filter, update)
					        .then(function(info){
						        socket.broadcast.emit('player left party',filter);
						    })
						    .catch(function(err){
						        console.log('***** clearOldSessions.update Failed:', err.message);
						    });
		              	}
				    })
				    .catch(function(err){
				        console.log('***** clearOldSessions.query Failed:', err.message);
				    });
	  }

	  function updateInPlay(profile,inPlayState) {
	  		var update = {in_play : inPlayState, session: socket.id};
		    mysql.update('user_has_player', profile, update)
			        .then(function(info){
				        console.log('User in_play set to', inPlayState);
				    })
				    .catch(function(err){
				        console.log('***** updateInPlay.update Failed:', err.message);
				    });
	  }

	  function joinTheParty(stats) {
	  		sendStats(stats,0,true);
			//update the feed
			updateNewsFeed(stats['player_name'],'joined the party!','neutral');
	  }

	  function leaveTheParty(session) {
	  		getProfile(session, function (err, profile) {
	  			if(!err){
	  				if(profile){
	  					socket.broadcast.emit('player left the party',profile);//update the feed
	  					getStats(profile['player_id'],function (err,data) {
	  						if(!err){
	  							updateNewsFeed(data['player_name'],'left the session!','neutral');
	  						} else {
	  							console.log('***** leaveTheParty.getStats Failed:', err.message);
	  						}
	  					});
						
	  				}
	  			} else {
	  				console.log('***** leaveTheParty.getProfile Failed:', err.message);
	  			}
	  		})
			
	  }

	  function sendStats(stats,session,isNew) {
		  	console.log('got session ',session);
		  	//determine if this is coming from a player joining or a gm pushing an update
		  	if(session==0){
		  		socket.emit('heres your stats',stats);
		  	} else {
		  		console.log('sending to session ',session, ' ', stats);
		  		socket.broadcast.to(session).emit('heres your stats',stats);
		  		socket.emit('heres your stats',stats);
		  	}
		  	
		  	if(isNew){
		  		//build the companion divs
		  		socket.broadcast.emit('player joined the party',stats);
		  	} else {
		  		//update the companion divs
		  		socket.broadcast.emit('player updated',stats);
		  	}
	  }

	   function getSession(profile, callback) {
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

	  function updateNewsFeed(playerName,action,type) {
	  		var text = playerName + ' ' + action;
	  		var html ='<div id=item class='+type+' style="display:none">'+
			  			'<p>'+text+'</p>'+
			  		  '</div>';
	  		socket.broadcast.emit('feed updated',html);
	  }

      function getStats(playerId, callback) {
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

      //******** Stat Setters ********** *//
      function addLE(data) {
      	var sql = 'UPDATE players set LE = LE + ? where player_id = ?';
    	var values = [data['value'] ,data['player_id']];
    	mysql.query(sql,values)
		    .then(function(currPlayer){
		    	getStats(data['player_id'], function (err, stats) {
				if(err){
					console.log('I hate async',err);
				} else {
					//send stats back to player and add companion div to other players
					sendStats(stats,data['session'],false);
					var msg ='';
					var sentiment = '';
					if(data['value']>0){
						msg = ' recovered ' + data['value'] + ' health!';
						sentiment = 'good';
					} else {
						msg = ' took ' + data['value'] + ' damage!';
						sentiment = 'bad';
					}
					//update the feed
					updateNewsFeed(stats['player_name'],msg,sentiment);
				}
			});
		    	//update gm sheet
		    	
		    })
		    .catch(function(err){
		        console.log('***** addLE Failed:', err.message);
		    });
      }
      function addEnergies(energyArray) {
      		var sql = 'UPDATE players set SE = SE + ?, ME = ME + ?, PE = PE + ? where player_id = ?';
	    	var values = [energyArray['SE'] ,energyArray['ME'] ,energyArray['PE'] ,energyArray['player_id']];
	    	mysql.query(sql,values)
			    .then(function(currPlayer){
			    		getStats(energyArray['player_id'], function (err, stats) {
							if(err){
								console.log('I hate async',err);
							} else {
								//send stats back to player and add companion div to other players
								sendStats(stats,energyArray['session'],false);
							}
						});
			    })
			    .catch(function(err){
			        console.log('***** socket.on.energies-affected Failed:', err.message);
			    });
      }
      //give item needs to send different data to a speical player

      function createPlayer(details,userId) {
      	console.log(details);
      	mysql.insert('players', details)
		    .then(function(stats){
		        console.log('Created player ',stats.insertId);
		        linkUserPlayer(userId,stats.insertId,details,function (err,success) {
		        	if(!err){
		        		socket.emit('created!');//tell the create page to redirect
		        	} else {
		        		console.log('**** linkUserPlayer call back failed:',err.message);
		        	}
		        })
		    })
		    .catch(function(err){
		        console.log('***** createPlayer.insert1 Failed:', err.message);
		    });
      }

      function linkUserPlayer(userId,playerId,details, callback) {
      	 mysql.insert('user_has_player', 
      	 	{	user_id:userId,
      	 		player_id:playerId,
      	 		in_play:0,
      	 		BASE_PE:details['PE'],
      	 		BASE_ME:details['ME'],
      	 		BASE_SE:details['SE']
      	 	})
		    .then(function(rs){
		        console.log('Linked player:' , playerId, ' to user ',userId);
		        callback(null,true);
		    })
		    .catch(function(err){
		        console.log('***** linkUserPlayer.insert Failed:', err.message);
		        callback(err,null);
		    });
      }



      socket.on('disconnect', function () {
		console.log('User disconnect:',socket.id);
		leaveTheParty(socket.id);
		});

	});
	

}

