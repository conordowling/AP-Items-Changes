function champ_reduce(key, values) {
	return Array.sum(values);
	champ_stats = Object()
	champ_stats.id = key;
	champ_stats.games = Array.sum(values);
	return champ_stats;
}