from pymongo import MongoClient
import pymongo
import riotwatcher as rw
from riotwatcher import RiotWatcher
from riotwatcher import LoLException
import time
import progressbar
from optparse import OptionParser
import json

URL = "98.216.209.75"
CHALLENGE_DB = "API_Challenge"


# frodo621 key: 
key = "45fbe47f-84f1-43b6-9394-9f433a23d522"

class MongoDBSafe:
    def __init__(self, db, collection, url="127.0.0.1", port="27017"):
        self.url = url
        self.port = port
        self.db = db
        self.collection = collection
        self.connection = MongoClient("mongodb://"+url+":"+port)
        
    def push(self, doc):
        return self.connection[self.db][self.collection].insert(doc)
    
    def get(self, doc):
        return self.connection[self.db][self.collection].find_one(doc)

watcher = RiotWatcher(key)

def wait_for_request():
	while not watcher.can_make_request():
		time.sleep(0.1)


for patch in ["5.11", "5.14"]:
    for region in ["BR","EUNE","EUW","KR","LAN","LAS","NA","OCE","RU","TR"]:
        print "REGION: ", region
        data = open(patch + "/RANKED_SOLO/" + region + ".json")
        matches = json.load(data)
        collection  = MongoDBSafe(CHALLENGE_DB, patch + "_" + region, url=URL)
        region_var = region.lower()
	if collection.connection[collection.db][collection.collection].count() == len(matches):
		matches = []
        for match in matches:
	    print(match)
            if not collection.get({"_id":match}):
                wait_for_request()
                print("querying match")
                try:
                    match_data = watcher.get_match(match, region=region_var, include_timeline=True)
                    # add in _id field
                    match_data["_id"] = match_data["matchId"]
                    collection.push(match_data)
                except LoLException as error:
                    print "ERROR: ", error.error
