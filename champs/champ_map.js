function champ_map() {

	var game = this;
	var info = Object();

	for(i in game.participants) {
		player = game.participants[i];
		emit(player.championId, 1);
	}

}