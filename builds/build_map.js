function build_map() {
	var game = this;
	patch = game.matchVersion.substring(0,game.matchVersion.indexOf(".",2));

	for(i in game.participants) {
		player = game.participants[i];
		key = Object();
		key.patch = patch;
		key.region = game.region;
		key.tier = player.highestAchievedSeasonTier;
		key.champ = player.championId;
		key.match = game.matchId;

		items = Array();
		for(var i in game.timeline.frames) {
			frame = game.timeline.frames[i];
			for(var j in frame.events) {
				lol_event = frame.events[j];
				if(lol_event.eventType == "ITEM_PURCHASED" && lol_event.participantId == player.participantId) {
					items.push(lol_event);				
				}
			}
		}
		emit(key, {"items":items});
	}
}