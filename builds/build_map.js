function build_map() {
	var game = this;
	patch = game.matchVersion.substring(0,game.matchVersion.indexOf(".",2));


	FINISHED_ITEMS = [3089,3087,3085,3083,3285,3290,3092,3472,3748,3110,3102,3100,3800,3504,3508,3146,3003,3004,3156,3153,3152,3151,3139,3135,3001,3143,3142,3401,3141,3124,3027,3025,3026,3512,3035,3031,3222,3115,3116,3022,3023,3053,3050,3190,3056,3046,3069,3071,3174,3172,3078,3074,3075,3170,3072,2045,3157,3060,3165,3065,3068];
	BOOTS = [3009, 3117, 3158, 3047, 3111, 3020,3006];
	GROUPS = [
		[3725,3721,3717,3709],
		[3724, 3720,3716,3708],
		[3723,3719,3714,3707],
		[3726,3722,3718,3710]
	];

	function contains(a, obj) {
	    for (var i = 0; i < a.length; i++) {
	        if (a[i] === obj) {
	            return true;
	        }
	    }
	    return false;
	}



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
					if(contains(FINISHED_ITEMS,lol_event.itemId)) {
						items.push(lol_event.itemId);										
					} else if(contains(BOOTS,lol_event.itemId)) {
						boots = lol_event.itemId;
					} else {
						for(i=0; i < GROUPS.length; ++i) {
							if(contains(GROUPS[i],lol_event.itemId)) {
								items.push(GROUPS[i][0])
							}
						}
					}
				}
			}
		}
		if( items.length >= 3 && boots != null) {
			key.boots = boots;
			key.first = items[0];
			key.second = items[1];
			key.third = items[2];
			emit(key, 1);
		}
	}
}