from bson.code import Code
from pymongo import MongoClient
import pymongo
import json
import time
import riotwatcher
from riotwatcher import RiotWatcher
from collections import defaultdict
from sklearn.decomposition import PCA
from sklearn.random_projection import GaussianRandomProjection
import numpy as np
from matplotlib import pyplot as plt

start_time = time.time()

URL = "98.216.209.75"

db  = MongoClient("mongodb://"+URL+":27017")

AP_ITEMS = {}
with open('ap_items.json', 'r') as ap:
	placeholder = json.load(ap)
	for key in placeholder.keys():
		AP_ITEMS[int(key)] = placeholder[key]

# key = ( patch, region, champ )
# key = ( patch, tier, champ )
# values = [ feature vector ]


region_data = defaultdict(lambda: [0]*len(AP_ITEMS))
tier_data = defaultdict(lambda: [0]*len(AP_ITEMS))
cross_data = defaultdict(lambda: [0]*len(AP_ITEMS))
patch_data = defaultdict(lambda: [0]*len(AP_ITEMS))

region_games = defaultdict(lambda: 0)
tier_games = defaultdict(lambda: 0)
cross_games = defaultdict(lambda: 0)
patch_games = defaultdict(lambda: 0)

for patch in ["5.11", "5.14"]:
    for region in ["BR","EUNE","EUW","KR","LAN","LAS","NA","OCE","RU","TR"]:
		item_results = db["API_Challenge"][patch + "_" + region + "Item_Freq"]
		champ_results = db["API_Challenge"][patch + "_" + region + "_Champs"]
		print patch, region
		print(item_results.count())
		print champ_results.count()
		for e in item_results.find():
			k = e['_id']
			if k['item'] in AP_ITEMS.keys():
				index = AP_ITEMS.keys().index(int(k['item']))
				region_data[( k['patch'], k['region'], k['champ'] )] [index] += e['value']
				#region_data[( k['patch'], k['region'], k['tier'], k['champ'] )] [index] += e['value']
				tier = k['tier']
				if tier in ["MASTER", "CHALLENGER"]:
					tier = "DIAMOND"

				tier_data[( k['patch'], tier, k['champ'] )] [index] += e['value']

				cross_data[( k['patch'], k['region'], tier, k['champ'] )][index] += e['value']

				patch_data[( k['patch'], k['champ'])][index] += e['value']

		for c in champ_results.find():
			k = c['_id']
			key = ( k['patch'], k['region'], k['champ'] )
			#key = ( k['patch'], k['region'], k['tier'], k['champ'] )
			region_games[key] += c['value']
			tier = k['tier']
			if tier in ["MASTER", "CHALLENGER"]:
				tier = "DIAMOND"
			tier_games[( k['patch'], tier, k['champ'] )] += c['value']
			cross_games[( k['patch'], k['region'], tier, k['champ'] )] += c['value']
			patch_games[(k['patch'], k['champ'])] += c['value']

		
for key in region_games.keys():
	region_data[key] = map( lambda x: float(x)/region_games[key], region_data[key])

for key in tier_games.keys():
	tier_data[key] = map( lambda x: float(x)/tier_games[key], tier_data[key])

for key in cross_games.keys():
	cross_data[key] = map( lambda x: float(x)/cross_games[key], cross_data[key])

for key in patch_games.keys():
	patch_data[key] = map( lambda x: float(x)/patch_games[key], patch_data[key])

#print region_data[region_data.keys()[0]]

ap_champs = defaultdict(lambda: False)
for key in region_data:
	if sum(region_data[key]) >= 1:
		ap_champs[key[2]] = True

for key in tier_data:
	if sum(tier_data[key]) >= 1:
		ap_champs[key[2]] = True


ap_region_data = { k:v for (k,v) in region_data.items() if ap_champs[k[2]]}
ap_tier_data = { k:v for (k,v) in tier_data.items() if ap_champs[k[2]]}
ap_cross_data = { k:v for (k,v) in cross_data.items() if ap_champs[k[3]]}
ap_patch_data = { k:v for (k,v) in patch_data.items() if ap_champs[k[1]]}

all_ap_data = ap_region_data.values() + (ap_tier_data.values()) + ap_cross_data.values() + ap_patch_data.values()

#print(ap_champs)

#pca = PCA(n_components=2)
#reduction = pca.fit_transform(ap_champs.values())
#print(pca.explained_variance_ratio_)

grp = GaussianRandomProjection(2, random_state = 0)
grp.fit(all_ap_data)
region_reduction = grp.transform(ap_region_data.values())
tier_reduction = grp.transform(ap_tier_data.values())
cross_reduction = grp.transform(ap_cross_data.values())
patch_reduction = grp.transform(ap_patch_data.values())

region_json_data = []
for i in range(0,len(ap_region_data.keys())):
	key = ap_region_data.keys()[i]
	data = list(region_reduction[i])
	num_games = region_games[key]
	region_json_data.append( {
		"patch":key[0],
		"region":key[1],
		#"tier":key[2],
		"champion":key[2],
		"coordinate":{
			"x":data[0],
			"y":data[1]
		},
		"games":num_games
		}  )

tier_json_data = []
for i in range(0,len(ap_tier_data.keys())):
	key = ap_tier_data.keys()[i]
	data = list(tier_reduction[i])
	num_games = tier_games[key]
	tier_json_data.append( {
		"patch":key[0],
		"tier":key[1],
		"champion":key[2],
		"coordinate":{
			"x":data[0],
			"y":data[1]
		},
		"games":num_games
		}  )

cross_json_data = []
for i in range(0,len(ap_cross_data.keys())):
	key = ap_cross_data.keys()[i]
	data = list(cross_reduction[i])
	num_games = cross_games[key]
	cross_json_data.append( {
		"patch":key[0],
		"region":key[1],
		"tier":key[2],
		"champion":key[3],
		"coordinate":{
			"x":data[0],
			"y":data[1]
		},
		"games":num_games
		}  )

patch_json_data = []
for i in range(0,len(ap_patch_data.keys())):
	key = ap_patch_data.keys()[i]
	data = list(patch_reduction[i])
	num_games = patch_games[key]
	patch_json_data.append( {
		"patch":key[0],
		"champion":key[1],
		"coordinate":{
			"x":data[0],
			"y":data[1]
		},
		"games":num_games
		}  )


for patch in ["5.11", "5.14"]:
	for region in ["BR","EUNE","EUW","KR","LAN","LAS","NA","OCE","RU","TR"]:
		filtered = filter(lambda x: x["patch"] == patch and x["region"] == region, region_json_data)
		with open("data/by_patch_region/grp_" + patch + "_" + region + ".json", "w") as f:
			json.dump(filtered, f)

	for tier in ["BRONZE","SILVER","GOLD","PLATINUM","DIAMOND"]:
		filtered = filter(lambda x: x["patch"] == patch and x["tier"] == tier, tier_json_data)
		with open("data/by_patch_tier/grp_"+patch+"_"+tier +".json", "w") as f:
			json.dump(filtered, f)

	for region in ["BR","EUNE","EUW","KR","LAN","LAS","NA","OCE","RU","TR"]:
		for tier in ["BRONZE","SILVER","GOLD","PLATINUM","DIAMOND"]:
			filtered = filter(lambda x: x["patch"] == patch and x["tier"] == tier and x["region"] == region, cross_json_data)
			with open("data/by_patch_region_tier/grp_" + patch + "_" + region + "_" + tier + ".json", 'w') as f:
				json.dump(filtered, f)

	filtered = filter(lambda x: x['patch'] == patch, patch_json_data)
	with open("data/by_patch/grp" + patch + ".json", 'w') as f:
		json.dump(filtered, f)



plt.scatter(map(lambda x: x[0], region_reduction), map(lambda x: x[1], region_reduction))
plt.show()

print time.time() - start_time, "seconds"


