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
            'apikey': "",
            'secret': "",
            'botStatus': False,
            'minRate': 0.005,
            'minRateLonger': 0.05,
            'pid': -1,
            'duration': 60
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
    def connectKey(apikey, secret, name):
        client = MongoClient('localhost', 27017)
        db = client['beesmart']
        collection = db['userlist']
#        mycollection = collection.find_one({'name' : name})
        collection.update_one({'name': name}, {'$set':{'apikey': apikey, 'secret': secret}}, upsert=False)
        print(apikey)
        print(secret)
        print(name)
    
    def setLendParam(minRate, minRateLonger, duration, name):
        client = MongoClient('localhost', 27017)
        db = client['beesmart']
        collection = db['userlist']
#        mycollection = collection.find_one({'name' : name})
        collection.update_one({'name': name}, {'$set':{'minRate': minRate, 'minRateLonger': minRateLonger, 'duration': duration}}, upsert=False)

    def getBotParam(name):
        client = MongoClient('localhost', 27017)
        db = client['beesmart']
        collection = db['userlist']
#        mycollection = collection.find_one({'name' : name})
        ret = collection.find_one({'name': name})
        return ret
    
    def setStatus(name, status):
        client = MongoClient('localhost', 27017)
        db = client['beesmart']
        collection = db['userlist']
#        mycollection = collection.find_one({'name' : name})
        collection.update_one({'name': name}, {'$set':{'botStatus': status}}, upsert=False)

    def setPID(name, pid):
        client = MongoClient('localhost', 27017)
        db = client['beesmart']
        collection = db['userlist']
#        mycollection = collection.find_one({'name' : name})
        collection.update_one({'name': name}, {'$set':{'pid': pid}}, upsert=False)