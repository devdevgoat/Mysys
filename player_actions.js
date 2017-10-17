/*
Player actions include
	Use an item (drink,slice,read,cast,etc)
	Picking up an item
	Dropping an item
	Giving an item
	defend 
		prompts for energy contributions, starting at 0+modifiers. Should this count as a use and decrment the # of uses? if it does,
		 you'd have to choose what to defend with, in which case no modifiers would apply until selected? probalby wont' count agains at first

	
	USE: Using a weapon will be the attack and function the same as an item
			1 click an item (hover might be too distracting?)
				a icons slide over from right side covering all but the item icon with 
				b use (drink,slice,read,cast,etc), drop, gift
			2 player clicks an icon
				a all  (N)PC icons in play (self is first) fill the space from the right. far right icon is an x and v for cancle and confirm
				b tool tip with player name
			3 player clicks an icon, toggle highlights
				a number of selections are allowed by either
					single use (#targets =1) how many you have of the item (need to add na x# to the left of the icon so it remains visible)
					multi use (#targets > 1) allows for number targest + count that you have 
				b click x or v
					i x closes the player list
					ii v emits the selection to the server
			4. stats are updated

	Backend Functions required for use
		1. none, fronted only
		2. get the icons, names, and ids of all in play characters: https://api.jquery.com/each/ 
		3. css toggle that decrements the number of targets available and pushes id to an array
		3a. should store # of targets in the div element at creation
		3bii. x emits to server the array of selected characters, the item id
		4. server calculates new stats for each player in array and emits the new stats out.
		5. update the feed once

	Steps to implement:
			0. write item CRUD functions
		1. write a 'user has items' lookup that gets called and pushed to the div
		2. write the hover css
		3. write the front end toggle and array builder

	queries required
		0. 
*/