from django.db import models
from django.template.loader import render_to_string, get_template
from pymongo import MongoClient
from bson.objectid import ObjectId
from django.template import Context
from django.core.mail import EmailMultiAlternatives
from random import randint


class Login(models.Model):
    def sendRequest(name, password):    
        client = MongoClient('localhost', 27017)
        db = client['beesmart']
        collection = db['userlist']
        request = {
            'name' : name,
            'pass' : password,
            'confirm' : True
        }
        ret = collection.find(request).count()
        return ret

class Register(models.Model):
    def sendRequest(name, password, email):    
        strGreeting = 'Hello '

        client = MongoClient('localhost', 27017)
        db = client['beesmart']
        collection = db['userlist']

        hashCode = randint(12000, 99999)
        request = {
            'name' : name,
            'pass' : password,
            'email' : email,
            'confirm' : True,
            'hash' : hashCode,
            'poloapikey': "",
            'polosecret': "",
            'polobotStatus': False,
            'polominRate': 0.005,
            'polominRateLonger': 0.05,
            'polopid': -1,
            'poloduration': 60,
            'bitapikey': "",
            'bitsecret': "",
            'bitbotStatus': False,
            'bitminRate': 0.005,
            'bitminRateLonger': 0.05,
            'bitpid': -1,
            'bitduration': 30,
        }
        ret = collection.find({'name' : name, 'email' : email}).count()
        if (ret > 0): return -1
        if (ret == 0):
            ret = collection.insert_one(request).inserted_id
#            d = Context({ 'mainCode' : hashCode})
#            message = get_template('verify.html').render(d)            
#            msg = EmailMultiAlternatives(str(strGreeting) + str(name), message, to=[email])
#            msg.attach_alternative(message, "text/html")
#            msg.send()
            return 1

class Confirm(models.Model):
    def sendRequest(name, password, email, hashnumber):
        client = MongoClient('localhost', 27017)
        db = client['beesmart']
        collection = db['userlist']
        ret = collection.find({"name" : name, "pass" : password, "email" : email, "hash" : int('0' + hashnumber)}).count()
        print(name)
        print(password)
        print(email)
        print(hashnumber)
        print(ret)
        if (ret == 1):
            collection.update_one({"name" : name, "pass" : password, "email" : email, "hash" : int('0' + hashnumber)}, {'$set' : {'confirm' : True}})
        return ret

class CheckName(models.Model):
    def sendRequest(name):
        client = MongoClient('localhost', 27017)
        db = client['beesmart']
        collection = db['userlist']
        ret = collection.find({'name' : name}).count()
        return ret

class Bots(models.Model):
    def connectKey(apikey, secret, name, exchange):
        client = MongoClient('localhost', 27017)
        db = client['beesmart']
        collection = db['userlist']
#        mycollection = collection.find_one({'name' : name})
        if ( exchange == "Poloniex" ):
            collection.update_one({'name': name}, {'$set':{'poloapikey': apikey, 'polosecret': secret}}, upsert=False)
        elif ( exchange == "Bitfinex" ):
            collection.update_one({'name': name}, {'$set':{'bitapikey': apikey, 'bitsecret': secret}}, upsert=False)
        print(apikey)
        print(secret)
        print(name)
    
    def setLendParam(minRate, minRateLonger, duration, name, exchange):
        client = MongoClient('localhost', 27017)
        db = client['beesmart']
        collection = db['userlist']
#        mycollection = collection.find_one({'name' : name})
        if ( exchange == "Poloniex" ):
            collection.update_one({'name': name}, {'$set':{'polominRate': minRate, 'polominRateLonger': minRateLonger, 'poloduration': duration}}, upsert=False)
        elif ( exchange == "Bitfinex" ):
            collection.update_one({'name': name}, {'$set':{'bitminRate': minRate, 'bitminRateLonger': minRateLonger, 'bitduration': duration}}, upsert=False)

    def getBotParam(name):
        client = MongoClient('localhost', 27017)
        db = client['beesmart']
        collection = db['userlist']
#        mycollection = collection.find_one({'name' : name})
        ret = collection.find_one({'name': name})
        return ret
    
    def setStatus(name, status, exchange):
        client = MongoClient('localhost', 27017)
        db = client['beesmart']
        collection = db['userlist']
#        mycollection = collection.find_one({'name' : name})
        if ( exchange == "Poloniex" ):
            collection.update_one({'name': name}, {'$set':{'polobotStatus': status}}, upsert=False)
        elif ( exchange == "Bitfinex" ):
            collection.update_one({'name': name}, {'$set':{'bitbotStatus': status}}, upsert=False)

    def setPID(name, pid, exchange):
        client = MongoClient('localhost', 27017)
        db = client['beesmart']
        collection = db['userlist']
#        mycollection = collection.find_one({'name' : name})
        if ( exchange == "Poloniex" ):
            collection.update_one({'name': name}, {'$set':{'polopid': pid}}, upsert=False)
        elif ( exchange == "Bitfinex" ):
            collection.update_one({'name': name}, {'$set':{'bitpid': pid}}, upsert=False)