from django.shortcuts import render
from django.views.generic import TemplateView
from django.http import HttpResponse, HttpResponseRedirect
from django.core.urlresolvers import reverse
from pymongo import MongoClient
from modules.models import *
import modules.bots as bots
from django.http import JsonResponse

import json



# Create your views here.
class LoginView(TemplateView):
    template_name = "login.html"

class IndexView(TemplateView):
    template_name = "index.html"

class GraphView(TemplateView):
    template_name = "graph_v02.html"

class SettingsView(TemplateView):
    template_name = "settings_v03.html"

class AboutView(TemplateView):
    template_name = "about.html"

class HelpView(TemplateView):
    template_name = "help.html"

class VerifyView(TemplateView):
    template_name = "verify.html"

class ChartView(TemplateView):
    template_name = "chart.html"

def login(request):
    if (request.method == 'POST'):
        postName = request.POST['name']
        postPass = request.POST['pass']

        ret = Login.sendRequest(postName, postPass)
        if (ret > 0):
            return HttpResponse('home')
        if (ret == 0):
            return HttpResponse('failed')

def register(request):
    if (request.method == 'POST'):
        regName = request.POST['name']
        regPass = request.POST['pass']
        regMail = request.POST['email']

        ret = Register.sendRequest(regName, regPass, regMail)

        if (ret == -1): return HttpResponse('failed')
        if (ret == 1):  return HttpResponse('wait')

def chksamename(request):
    if (request.method == 'POST'):
        chkName = request.POST['name']

        ret = CheckName.sendRequest(chkName)

        if (ret > 0): return HttpResponse('existed')
        if (ret == 0):  return HttpResponse('success')

def confirm(request):
    if (request.method == 'POST'):
        confName = request.POST['name']
        confPass = request.POST['pass']
        confMail = request.POST['email']
        confHash = request.POST['hash']

        if ((confName!='')&(confPass!='')&(confMail!='')&(confHash!='')):
            ret = Confirm.sendRequest(confName, confPass, confMail, confHash)
            if (ret > 0): return HttpResponse('success')

        return HttpResponse('error')

def setParam(request):
    if (request.method == 'POST'):
        print("SetParam")
        bots.setBotLendParam(request.POST['minRate'], request.POST['minRateLonger'], request.POST['duration'], request.POST['username'])
        return HttpResponse('success')
        
def setKey(request):
    if (request.method == 'POST'):
        print(request.POST['username'])
        Bots.connectKey(request.POST['API'], request.POST['Secret'], request.POST['username'])
        print("SetKey")
        return HttpResponse('success')

def startBot(request):
    if (request.method == 'POST'):
        print("StartBot")
        ret = bots.makeBot(request.POST['username'])
        if (ret == 1):
            return HttpResponse('success')
        elif (ret == 0):
            print("Alread Activated")
            return HttpResponse('exist')

def stopBot(request):
    if (request.method == 'POST'):
        print("StopBot")
        bots.stopBot(request.POST['username'])
        return HttpResponse('success')

def sendBotLog(request):
    if (request.method == 'GET'):
        print("Get BotLog Request")
#       Change Path
#        data = open('/Volumes/Backup/workspace/Rio(Python_Crypto_Lending_Bot)/poloniexlendingbot/www/botlogs/' + request.GET['username'] + '_botlog.json').read() #opens the json file and saves the raw contents        
        data = open('/var/www/tradingbot/PoloniexLendingBotProject/PoloniexLendingBot/www/botlogs/' + request.GET['username'] + '_botlog.json').read() #opens the json file and saves the raw contents        
        jsonData = json.loads(data)
        return JsonResponse(jsonData)

def sendSpeedData(request):
    if (request.method == 'GET'):
        print("Get BotLog Request")
#       Change Path
#        data = open('/Volumes/Backup/workspace/Rio(Python_Crypto_Lending_Bot)/poloniexlendingbot/www/botlogs/speedTest.json').read() #opens the json file and saves the raw contents        
        data = open('/var/www/tradingbot/PoloniexLendingBotProject/PoloniexLendingBot/www/botlogs/speedTest.json').read() #opens the json file and saves the raw contents        
        data = "{\"chartData\":" + "[" + data + "{}]}"
        jsonData = json.loads(data)
        return JsonResponse(jsonData)

def getbotInfo(request):
    if (request.method == 'GET'):
        print("\n\nGet BotInfo Request\n\n")
        data = Bots.getBotParam(request.GET['username'])
        del data['_id']
        if ( bots.isBotInActive(request.GET['username']) == 0):
            data['botStatus'] = True
        else:
            data['botStatus'] = False
#        jsonData = json.loads(data) 
        return JsonResponse(data)
