module.exports = function(socket){
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
	function updateNewsFeed(playerName,action,type) {
			var text = playerName + ' ' + action;
			var html ='<div id=item class='+type+' style="display:none">'+
		  			'<p>'+text+'</p>'+
		  		  '</div>';
			socket.broadcast.emit('feed updated',html);
	}

	console.log('loaded player_communication');
}