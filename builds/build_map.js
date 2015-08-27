function build_map() {
	var game = this;
	patch = game.matchVersion.substring(0,game.matchVersion.indexOf(".",2));


	FINISHED_ITEMS = []

	for(i in game.participants) {
		player = game.participants[i];
		key = Object();
		key.patch = patch;
		key.region = game.region;
		key.tier = player.highestAchievedSeasonTier;
		key.champ = player.championId;

		items = Array();
		boots = null;
		for(var i in game.timeline.frames) {
			frame = game.timeline.frames[i];
			for(var j in frame.events) {
				lol_event = frame.events[j];
				if(lol_event.eventType == "ITEM_PURCHASED" && lol_event.participantId == player.participantId) {
					if(lol_event.itemId in FINISHED_ITEMS) {
						items.push(lol_event);										
					} else if(lol_event.itemId in BOOTS) {
						boots = lol_event;
					}
				}
			}
		}
		if( items.length >= 3 && boots != null) {
			key.boots = boots;
			key.first = items[0];
			key.second = items[1];
			key.third = items[2];
		}
		emit(key, 1);
	}
}