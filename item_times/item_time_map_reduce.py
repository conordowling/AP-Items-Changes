from bson.code import Code
from pymongo import MongoClient
import pymongo
import json
import time

URL = "98.216.209.75"

db  = MongoClient("mongodb://"+URL+":27017")

map_js = Code(open('item_time_map.js', 'r').read())
reduce_js = Code(open('item_time_reduce.js','r').read())

for patch in ["5.11", "5.14"]:
    for region in ["BR","EUNE","EUW","KR","LAN","LAS","NA","OCE","RU","TR"]:
		print patch, region
		start_time = time.time()
		results = db['API_Challenge'][patch + "_" + region].map_reduce(map_js, reduce_js, patch + "_" + region + "_Item_Times")
		print start_time - time.time(), "seconds"

print results

