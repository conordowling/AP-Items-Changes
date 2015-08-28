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

champion_builds = defaultdict(lambda: [])
champion_items = defaultdict(lambda: defaultdict(lambda:0))
champion_games = defaultdict(lambda: 0)

for patch in ["5.11", "5.14"]:
    for region in ["BR"]:#,"EUNE","EUW","KR","LAN","LAS","NA","OCE","RU","TR"]:
    	build_results = db["API_Challenge"][patch + "_" + region + "Builds"]
		for build in build_results.find():
			for item in build['values']['items']:
				#update champion builds data
				key = item['_id']
				#champion_builds[key["champ"]]				
				
				#update champion item statistics


				#update champion games played

			champion_builds[build['_id']['champ']].append(entry)