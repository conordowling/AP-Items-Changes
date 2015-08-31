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

ALL_ITEMS = [3089,3087,3085,3083,3285,3290,3092,3472,3748,3110,3102,3100,3800,3504,3508,3146,3003,3004,3156,3153,3152,3151,3139,3135,3001,3143,3142,3401,3141,3124,3027,3025,3026,3512,3035,3031,3222,3115,3116,3022,3023,3053,3050,3190,3056,3046,3069,3071,3174,3172,3078,3074,3075,3170,3072,2045,3157,3060,3165,3065,3068,3009, 3117, 3158, 3047, 3111, 3020,3006,3725,3721,3717,3709,3724, 3720,3716,3708,3723,3719,3714,3707,3726,3722,3718,3710]


champion_builds = defaultdict(lambda: defaultdict(lambda: []))
build_games = defaultdict(lambda: defaultdict(lambda: []))
champion_items = defaultdict(lambda: defaultdict(lambda: defaultdict(lambda: defaultdict(lambda: 0))))
champion_games = defaultdict(lambda: defaultdict(lambda: 0) )

for patch in ["5.11", "5.14"]:
    for region in ["BR","EUNE","EUW","KR","LAN","LAS","NA","OCE","RU","TR"]:

		print patch, region
		build_results = db["API_Challenge"][patch + "_" + region + "Builds"]
		for build in build_results.find():
			key = build['_id']

			for region in [key["region"], "ALL_REGIONS"]:
				for tier in [key['tier'], "ALL_TIERS"]:
					if tier in ["MASTER","CHALLENGER"]:
						tier = "DIAMOND"
					if tier == "UNRANKED":
						tier = "BRONZE"
					#update champion builds data
					build_array = [0]*len(ALL_ITEMS)
					build_array[ ALL_ITEMS.index(int(key["first"])) ] = 4
					build_array[ ALL_ITEMS.index(int(key["second"])) ] = 3
					build_array[ ALL_ITEMS.index(int(key["third"])) ] = 2
					build_array[ ALL_ITEMS.index(int(key["boots"])) ] = 1

					champion_builds[key['champ']] [(key['patch'], region, tier)].append(build_array)
					build_games[key['champ']] [(key['patch'], region, tier)].append(build['value'])
					
					#update champion item statistics
					champion_items[key['champ']] [(key["patch"], region, tier)] ["boots"] [key['boots']] += build['value']
					champion_items[key['champ']] [(key["patch"], region, tier)] ["first"] [key['first']] += build['value']
					champion_items[key['champ']] [(key["patch"], region, tier)] ["second"] [key['second']] += build['value']
					champion_items[key['champ']] [(key["patch"], region, tier)] ["third"] [key['third']] += build['value']

					#update champion games played
					champion_games[key['champ']] [(key['patch'], region, tier)] += build['value']

items_json = []
for champ in champion_builds.keys():

	# perform GaussianRandomProjection
	all_builds = []
	for key in champion_builds[champ]:
		all_builds += champion_builds[champ][key]

	grp = GaussianRandomProjection(2, random_state = 0)
	grp.fit(all_builds)

	for key in champion_builds[champ]:
		builds = champion_builds[champ][key]
		reduction = grp.transform(builds)

		# get top 100 builds
		zipped = zip(list(reduction), build_games[champ][key], builds)
		sorted_zipped = sorted(zipped, key=lambda x: x[1], reverse=True)
		top_builds = sorted_zipped[0:100]

		builds_json = []
		for i in top_builds:
			x = list(i[0])[0]
			y = list(i[0])[1]
			first = ALL_ITEMS[ i[2].index(4) ]
			second = ALL_ITEMS[ i[2].index(3) ]
			third = ALL_ITEMS[ i[2].index(2) ]
			boots = ALL_ITEMS[ i[2].index(1) ]
			builds_json.append( {
				"champ":champ,
				"patch":key[0],
				"region":key[1],
				"tier":key[2],
				"x":x,
				"y":y,
				"games":i[1],
				"first":first,
				"second":second,
				"third":third,
				"boots":boots
			} )
		filename = "../data/by_champion/" + str(int(champ)) + "_" + key[0] + "_" + key[1] + "_" + key[2] + "_builds.json"
		#print filename
		with open(filename, 'w') as f:
			json.dump(builds_json, f)

	# determine item order frequencies

	
	for key in champion_builds[champ].keys():
		entry = {
			"champ":champ,
			"patch":key[0],
			"region":key[1],
			"tier":key[2]
		}

		for item in ["boots", "first", "second", "third"]:
			sorted_items = sorted( champion_items[champ][key][item].items(), key=lambda x: x[1], reverse=True )
			top_items = sorted_items[0:5]
			entry[item] = map(lambda (a,b): {"item":a, "value":(b*1.0 / champion_games[champ][key])}, top_items)

		items_json.append(entry)

		with open("../data/champion_builds/"+ champ + "_" + key[0] + "_" + key[1] + "_" + key[2] + ".json", 'w') as f:
			json.dump(items_json,f)
