function item_freq_map() {
	var game = this;

	patch = game.matchVersion.substring(0,game.matchVersion.indexOf(".",2));

	if(game.timeline == null) {
		return;
	}

	championIds = Array(10);
	tiers = Array(10);
	for(i in game.participants) {
		player = game.participants[i];
		championIds[ player.participantId - 1] = player.championId;
		tiers[player.participantId - 1] = player.highestAchievedSeasonTier;
	}

	for(var i in game.timeline.frames) {
		frame = game.timeline.frames[i];
		for(var j in frame.events) {
			lol_event = frame.events[j];
			if(lol_event.eventType == "ITEM_PURCHASED") {
				key = Object();
				key.patch = patch;
				key.region = game.region;
				key.tier = tiers[lol_event.participantId - 1];
				key.item = lol_event.itemId;
				key.champ = championIds[lol_event.participantId - 1];
				emit(key, 1);
			}
		}
	}
}