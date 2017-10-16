module.exports = function(mysql){

	function createPlayer(details,userId, callback) {
		console.log(details);
		mysql.insert('players', details)
		.then(function(stats){
			console.log('Created player ',stats.insertId);
				linkUserPlayer(userId,stats.insertId,details,function (err,success) {
				if(!err){
					callback(null,true);
				} else {
					console.log('**** linkUserPlayer call back failed:',err.message);
					callback(err,false);
				}
			})
		})
		.catch(function(err){
		    console.log('***** createPlayer.insert1 Failed:', err.message);
		});
	}

	function linkUserPlayer(userId,playerId,details, callback) {
		mysql.insert('user_has_player', {	
				user_id:userId,
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
}