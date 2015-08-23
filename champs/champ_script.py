from bson.code import Code
from pymongo import MongoClient
import pymongo
import json
import time

start_time = time.time()

URL = "98.216.209.75"

db  = MongoClient("mongodb://"+URL+":27017")

map_js = Code(open('champ_map.js', 'r').read())
reduce_js = Code(open('champ_reduce.js','r').read())

results = db['API_Challenge']['5.11_BR'].map_reduce(map_js, reduce_js, '5.11_BR_Champs')
print start_time - time.time(), "seconds"
print results