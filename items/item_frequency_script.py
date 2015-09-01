from bson.code import Code
from pymongo import MongoClient
import pymongo
import json
import time

start_time = time.time()

URL = "98.216.209.75"

db  = MongoClient("mongodb://"+URL+":27017")

map_js = Code(open('item_map.js', 'r').read())
reduce_js = Code(open('sum_reduce.js','r').read())


for patch in ["5.11", "5.14"]:
    for region in ["BR","EUNE","EUW","KR","LAN","LAS","NA","OCE","RU","TR"]:
		print patch, region
		item_results = db['API_Challenge'][patch + "_" + region].map_reduce(map_js, reduce_js, patch + "_" + region + "Item_Freq")
		#champ_results = db['API_Challenge'][patch + "_" + region].map_reduce(champ_map_js, champ_reduce_js, patch + "_" + region + '_Champs')



print time.time() - start_time, "seconds"
print results

