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

map_js = Code(open('build_map.js', 'r').read())
reduce_js = Code(open('build_reduce.js','r').read())


for patch in ["5.11", "5.14"]:
    for region in ["BR","EUNE","EUW","KR","LAN","LAS","NA","OCE","RU","TR"]:
		build_results = db['API_Challenge'][patch + "_" + region].map_reduce(map_js, reduce_js, patch + "_" + region + "Builds")

print build_results.find_one()