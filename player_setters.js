const moment = require('moment');
const mysql     =     require('node-mysql-helper');//require("mysql");
const mysqlOptions    =    {
	connectionLimit   :   100,
	host              :   'localhost',
	user              :   'root',
	password          :   'N1h0ng0@',
	database          :   'mysys',
	debug             :   false
};
mysql.connect(mysqlOptions);
const crypto = require("crypto");

exports.addLE = function (data, callback) {
	let sql = 'UPDATE players set LE = LE + ? where player_id = ?';
	let values = [data['value'] ,data['player_id']];
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
	let sql = 'UPDATE players set SE = SE + ?, ME = ME + ?, PE = PE + ? where player_id = ?';
	let values = [energyArray['SE'] ,energyArray['ME'] ,energyArray['PE'] ,energyArray['player_id']];
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
	mysql.insert('players', details)
	.then(function(stats){
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
	let sql = 'SELECT players.player_name, user_has_player.player_id,user_has_player.user_id \
			from mysys.user_has_player inner join mysys.players \
			on user_has_player.player_id = players.player_id\
			and session = ?';
	let ins = [session];
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
	let upd = {
		reliquished_at : moment().format("YYYY-MM-DD HH:mm:ss")
	};
	mysql.update('player_items', itemKey, upd)
	.then(function(info){
		callback(null, info);
	})
	.catch(function(err){
		console.log('***** set.dropItem.update Failed:', err.message);
		callback(err,null);
	});	
}

exports.pickupItem = function (playerId,itemProfile, callback) {
	
	let newPickupKey = crypto.randomBytes(20).toString('hex');
	let upd = {
		player_id:playerId,
		reliquished_at: null,
		pickup_key: newPickupKey
	};
	console.log(upd);
	mysql.update('player_items', itemProfile, upd)
	.then(function(info){
		console.log('updated: ',itemProfile['item_name'],'successfully');
			callback(null, 'gotit');
		//rows affected didn't work, but need to check that above
	})
	.catch(function(err){
		console.log('***** set.pickupItem.update Failed:', err.message);
		callback(err,null);
	});	
}

exports.useItem = function(modType,modValue,targetPlayerId,callback){
	//first check the item type: weapon or consumable
	//weapons need an option to put force behind them: force (prompt) + mod_value
	//this will require a different set of html builds for equipment vs items, 
	//maybe even a 'useWeapon' function

	//items will simply apply the mod_val to the mod_type of the selected players
	//first, get 
	let sql = 'UPDATE players set '+modType+' = '+modType+' + '+modValue+' where player_id = '+targetPlayerId;
	mysql.query(sql)
	.then(function(info){ //need to check rows affected...
		callback(null, 'gotit');	
	})
	.catch(function(err){
		console.log('***** set.useItem.query Failed:', err.message);
		callback(err,null);
	});	
}

exports.giveItem = function (itemKey, playerId, callback) {
	let newPickupKey = crypto.randomBytes(20).toString('hex');
	let upd = {
		player_id:playerId,
		reliquished_at: null,
		pickup_key: newPickupKey
	};
	let itemProfile = {
		item_id : itemKey['item_id'],
		pickup_key: itemKey['pickup_key'] //insures an item can only be given once
	}
	console.log('---------->',itemProfile);
	mysql.update('player_items', itemProfile, upd)
	.then(function(info){
		console.log('updated: ',itemKey['item_name'],'successfully');
			callback(null, 'gotit');
		//rows affected didn't work, but need to check that above
	})
	.catch(function(err){
		console.log('***** set.giveItem.update Failed:', err.message);
		callback(err,null);
	});	
}

exports.NewPlayerItem = function (data,callback) {
	let newPickupKey = crypto.randomBytes(20).toString('hex');
	let ins = {
		player_id: data['player_id'],
		item_id: data['item_id'],
		reliquished_at: null,
		pickup_key: newPickupKey
	};
	mysql.insert('player_items', ins)
	.then(function(info){
		console.log('gave player ',data['player_id'], ' item ', data['item_id'],' successfully');
			callback(null, data['item_id']);
		//rows affected didn't work, but need to check that above
	})
	.catch(function(err){
		console.log('***** set.NewPlayerItem.insert Failed:', err.message);
		callback(err,null);
	});	
}







console.log('loaded player_setters');
