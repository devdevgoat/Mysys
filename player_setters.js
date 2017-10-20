var moment = require('moment');
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
var crypto = require("crypto");

exports.addLE = function (data, callback) {
	var sql = 'UPDATE players set LE = LE + ? where player_id = ?';
	var values = [data['value'] ,data['player_id']];
	mysql.query(sql,values)
	.then(function(currPlayer){
		callback(null,currPlayer);
	})
	.catch(function(err){
		console.log('***** set.addLE.query Failed:', err.message);
		callback(err,null);
	});
}

exports.addEnergies = function (energyArray,callback) {
	var sql = 'UPDATE players set SE = SE + ?, ME = ME + ?, PE = PE + ? where player_id = ?';
	var values = [energyArray['SE'] ,energyArray['ME'] ,energyArray['PE'] ,energyArray['player_id']];
	mysql.query(sql,values)
	.then(function(currPlayer){
		callback(null,currPlayer);
	})
	.catch(function(err){
		console.log('***** set.addEnergies.query Failed:', err.message);
		callback(err,null);
	});
}	

exports.createPlayer = function (details,userId, callback) {
	console.log(details);
	mysql.insert('players', details)
	.then(function(stats){
		console.log('Created player ',stats.insertId);
			linkUserPlayer(userId,stats.insertId,details,function(err,success) {
			if(!err){
				callback(null,true);
			} else {
				console.log('**** linkUserPlayer call back failed:',err.message);
				callback(err,false);
			}
		})
	})
	.catch(function(err){
		console.log('***** set.createPlayer.insert1 Failed:', err.message);
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
		console.log('***** set.linkUserPlayer.insert Failed:', err.message);
		callback(err,null);
	});
}

exports.updateInPlay = function (profile,session, callback) {
	//clear old session
	mysql.update('user_has_player', {user_id:profile['user_id'],in_play:1}, {in_play:0})
		.then(function(info){
			console.log('Sessions cleared: ', info.affectedRows);
			mysql.update('user_has_player', profile, {in_play : 1, session: session})
				.then(function(info){
					console.log('Now in play:',profile);
					callback(null,info);
				})
				.catch(function(err){
					console.log('***** set.updateInPlay.set-play-session Failed:', err.message);
					callback(err,null);
				});
		})
		.catch(function(err){
			console.log('***** set.updateInPlay.clear-old-sessions Failed:', err.message);
			callback(err,null);
		});
}


exports.leaveTheParty = function (session, callback) {
	var sql = 'SELECT players.player_name, user_has_player.player_id,user_has_player.user_id \
			from mysys.user_has_player inner join mysys.players \
			on user_has_player.player_id = players.player_id\
			and session = ?';
	var ins = [session];
	mysql.query(sql, ins)
		.then(function(player){
			callback(null, player);
		})
		.catch(function(err){
			console.log('***** set.leaveTheParty.query Failed:', err.message);
			callback(err,null);
		});	
}



exports.dropItem = function (itemKey, callback) {
	var upd = {
		reliquished_at : moment().format("YYYY-MM-DD HH:mm:ss")
	};
	console.log(itemKey);
	mysql.update('player_items', itemKey, upd)
	.then(function(info){
		callback(null, info);
	})
	.catch(function(err){
		console.log('***** set.dropItem.update Failed:', err.message);
		callback(err,null);
	});	
}

exports.pickupItem = function function_name(playerId,itemProfile) {
	
	var pickupKey = crypto.randomBytes(20).toString('hex');
	var upd = {
		player_id:playerId,
		reliquished_at: null,
		pickup_key: pickupKey
	};
	mysql.update('player_items', itemProfile, upd)
	.then(function(info){
		callback(null, info);
	})
	.catch(function(err){
		console.log('***** set.dropItem.update Failed:', err.message);
		callback(err,null);
	});	
}
console.log('loaded player_setters');
