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

map_js = Code(open('item_time_map.js', 'r').read())
reduce_js = Code(open('item_time_reduce.js','r').read())

item_times = defaultdict(lambda: 0)
games_data = defaultdict(lambda: 0)

for patch in ["5.11", "5.14"]:
    for region in ["BR","EUNE","EUW","KR","LAN","LAS","NA","OCE","RU","TR"]:
		print patch, region
		results = db['API_Challenge'][patch + "_" + region + "_Item_Times"]

		for e in results.find():
			k = e["_id"]
			patch = k['patch']
			item = k['item']
			minute = k['minute']
			for region in [k["region"], "ALL_REGIONS"]:
				for tier in [k['tier'], "ALL_TIERS"]:
					for champ in [k['champ'], "ALL_CHAMPS"]:
						item_times[(patch, region, tier, champ, item, minute)] += e['value']

		games = db['API_Challenge'][patch + "_" + region + "_Champs"];
		for e in games.find():
			k = e["_id"]
			patch = k['patch']
			for region in [k["region"], "ALL_REGIONS"]:
				for tier in [k['tier'], "ALL_TIERS"]:
					for champ in [k['champ'], "ALL_CHAMPS"]:
						games_data[(patch, region, tier, champ)] += e['value']


for key in item_times.keys():
	item_times[key] = item_times[key] *1.0 / games_data[( key[0], key[1], key[2], key[3] )]

json_data = []
for (key, value) in item_times.iteritems():
	json_data.append( {
		"patch":key[0],
		"region":key[1],
		"tier":key[2],
		"champ":key[3],
		"item":key[4],
		"minute":key[5],
		"frequency": value
	} )

with open("data/item_frequencies.json", 'w') as f:
	json.dump(json_data, f)


print time.time() - start_time, "seconds"
print results