function item_time_map() {
	var game = this;

	if(game.timeline == null) {
		return;
	}

	championIds = Array(10);
	for(i in game.participants) {
		player = game.participants[i];
		championIds[ player.participantId - 1] = player.championId;
	}

	for(var i in game.timeline.frames) {
		frame = game.timeline.frames[i];
		for(var j in frame.events) {
			lol_event = frame.events[j];
			if(lol_event.eventType == "ITEM_PURCHASED") {
				key = Object();
				key.patch = game.matchVersion;
				key.region = game.region;
				key.item = lol_event.itemId;
				key.champ = championIds[lol_event.participantId - 1];
				key.minute = Math.floor(lol_event.timestamp/60000);
				emit(key, 1);
			}
		}

	}
}