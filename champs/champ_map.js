function champ_map() {

	var game = this;
	patch = game.matchVersion.substring(0,game.matchVersion.indexOf(".",2));

	for(i in game.participants) {
		player = game.participants[i];
		key = Object();
		key.patch = patch;
		key.region = game.region;
		key.tier = player.highestAchievedSeasonTier;
		key.champ = player.championId;
		emit(key, 1);
	}

}