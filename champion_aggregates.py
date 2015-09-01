import json

champs = []
with open("www/data/champion_index.json",'r') as f:
	data = json.load(f)
	for elem in data["data"]:
		champs.append(elem)

result = {}
for champ in champs:
	result[champ] = {}
	minX = 0
	maxX = 100
	minY = 0
	maxY = 100
	for patch in ["5.11", "5.14"]:
		for region in ["BR","EUNE","EUW","KR","LAN","LAS","NA","OCE","RU","TR","ALL_REGIONS"]:
			for tier in ["BRONZE","SILVER","GOLD","PLATINUM","DIAMOND","ALL_TIERS"]:
				try:
					with open("www/data/by_champion/" + champ + "_" + patch + "_" + region + "_" + tier + "_builds.json", 'r') as f:
						data = json.load(f)
						for elem in data:
							if (elem["x"] < minX): minX = elem["x"]
							if (elem["x"] < maxX): maxX = elem["x"]
							if (elem["y"] < minY): minY = elem["y"]
							if (elem["y"] < maxY): maxY = elem["y"]
				except:
					pass
	result[champ]["minX"] = minX
	result[champ]["maxX"] = maxX
	result[champ]["minY"] = minY
	result[champ]["maxY"] = maxY
with open("test_aggregate_data.json","w") as f:
	json.dump(result, f)
