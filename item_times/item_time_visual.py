from bson.code import Code
from pymongo import MongoClient
import pymongo
import json
import time
from collections import defaultdict
import numpy as np
import matplotlib.pyplot as plt

URL = "98.216.209.75"

db  = MongoClient("mongodb://"+URL+":27017")


for collection in ['5.11_BR_Item_Times','5.14_BR_Item_Times']:
	results = db['API_Challenge'][collection]

	data = results.find()

	champion_items = defaultdict(lambda: defaultdict(lambda: [0] * 60))

	for entry in data:
		if int(entry["_id"]["minute"]) < 60:
			champion_items[entry["_id"]["champ"]][ int(entry["_id"]["item"]) ][int(entry["_id"]["minute"]) ] += entry["value"]

	print champion_items[1][1001]

	plt.scatter( range(0,60), champion_items[1][1001])
	plt.plot( range(0,60), champion_items[1][1001])

	#with open("data/" + collection + ".json", "w+") as f:
	#	json.dump(items, f)

plt.show()