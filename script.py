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

# key = ( patch, region, tier, champ )
# values = [ feature vector ]


final_data = defaultdict(lambda: [0]*len(AP_ITEMS))
games = defaultdict(lambda: 0)

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
				final_data[( k['patch'], k['region'], k['champ'] )] [index] += e['value']
				#final_data[( k['patch'], k['region'], k['tier'], k['champ'] )] [index] += e['value']

		for c in champ_results.find():
			k = c['_id']
			key = ( k['patch'], k['region'], k['champ'] )
			#key = ( k['patch'], k['region'], k['tier'], k['champ'] )
			games[key] += c['value']

		
for key in games.keys():
	final_data[key] = map( lambda x: float(x)/games[key], final_data[key])

#print final_data[final_data.keys()[0]]

ap_champs = {}
for key in final_data:
	if sum(final_data[key]) >= 1:
		ap_champs[key] = final_data[key]

#print(ap_champs)

#pca = PCA(n_components=2)
#reduction = pca.fit_transform(ap_champs.values())
#print(pca.explained_variance_ratio_)

grp = GaussianRandomProjection(2, random_state = 0)
reduction = grp.fit_transform(ap_champs.values())

json_data = []
for i in range(0,len(ap_champs.keys())):
	key = ap_champs.keys()[i]
	data = list(reduction[i])
	num_games = games[key]
	json_data.append( {
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

print(json_data[0])

for patch in ["5.11", "5.14"]:
    for region in ["BR","EUNE","EUW","KR","LAN","LAS","NA","OCE","RU","TR"]:
		filtered = filter(lambda x: x["patch"] == patch and x["region"] == region, json_data)
		print filtered
		with open("data/grp_" + patch + "_" + region, "w") as f:
			json.dump(filtered, f)


plt.scatter(map(lambda x: x[0], reduction), map(lambda x: x[1], reduction))
plt.show()

print time.time() - start_time, "seconds"


