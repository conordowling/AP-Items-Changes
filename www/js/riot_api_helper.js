function get_summoner_id_by_name(cb) {
    var summoner = "CommanderDuke"
    $.ajax({
        url: 'https://na.api.pvp.net/api/lol/na/v1.4/summoner/by-name/' + summoner + '?api_key=' + API_KEY,
        type: 'GET',
        dataType: 'json',
        data: {

        },
        success: function(json) {
            //Modify the elements here
            cb(err,json);
        }
    });
}