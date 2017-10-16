module.exports = function(mysql){

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
		})
		.catch(function(err){
		    console.log('***** addLE.query Failed:', err.message);
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
		    console.log('***** addEnergies.query Failed:', err.message);
		});
	}	

	console.log('loaded player_setters');
}