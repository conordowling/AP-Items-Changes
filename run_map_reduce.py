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

item_map_js = Code(open('items/item_map.js', 'r').read())
champ_map_js = Code(open('champs/champ_map.js', 'r').read())

reduce_js = Code(open('sum_reduce.js','r').read())


URL = "98.216.209.75"

db  = MongoClient("mongodb://"+URL+":27017")

for patch in ["5.11", "5.14"]:
	print "PATCH: ", patch
	for region in ["BR","EUNE","EUW","KR","LAN","LAS","NA","OCE","RU","TR"]:
		print "REGION: ", region
		item_results = db['API_Challenge'][patch + "_" + region].map_reduce(item_map_js, reduce_js, patch + "_" + region + "Item_Freq")
		champ_results = db['API_Challenge'][patch + "_" + region].map_reduce(champ_map_js, reduce_js, patch + "_" + region + '_Champs')