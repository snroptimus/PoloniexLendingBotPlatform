import time 
import threading
import subprocess
import psutil
from modules.models import *

def isBotInActive(Username):
    ret = Bots.getBotParam(Username)
    print(ret)

    if ( ret['pid'] == -1 ):    
        return 1
    else:
        if psutil.pid_exists(ret['pid']):
            return 0
        else:
            return 1

def activeSpeedBot():
#   Change Path
#    subprocess.Popen(["python", "/Volumes/Backup/workspace/Rio(Python_Crypto_Lending_Bot)/poloniexlendingbot/lending_speed.py"])
    subprocess.Popen(["python", "/var/www/tradingbot/PoloniexLendingBotProject/PoloniexLendingBot/lending_speed.py"])

def activateBot(Username):
    ret = Bots.getBotParam(Username)
    print("Bot Start")
#   Change Path
#    newProcess = subprocess.Popen(["python", "/Volumes/Backup/workspace/Rio(Python_Crypto_Lending_Bot)/poloniexlendingbot/lendingbot_my.py", ret['apikey'], ret['secret'], str(ret['minRate']), str(ret['minRateLonger']), str(ret['duration']), Username])
    newProcess = subprocess.Popen(["python", "/var/www/tradingbot/PoloniexLendingBotProject/PoloniexLendingBot/lendingbot_my.py", ret['apikey'], ret['secret'], str(ret['minRate']), str(ret['minRateLonger']), str(ret['duration']), Username])
    
    Bots.setPID(Username, newProcess.pid)
    
def makeBot(Username):
    """
    thread = threading.Thread(target=startBot, kwargs={'id': tID})
    thread.deamon = True
    print(thread.getName())
    thread.start()
    """
    if ( isBotInActive(Username) == 1 ):
        activateBot(Username)
        return 1
    else:
        return 0

def stopBot(Username):
    ret = Bots.getBotParam(Username)

    print("Stop")
    if ( isBotInActive(Username) == 0 ):
        if psutil.pid_exists(ret['pid']):
            p = psutil.Process(ret['pid'])
            p.terminate()
            Bots.setPID(Username, -1)

def setBotLendParam(minRate, minRateLonger, duration, name):
    Bots.setLendParam(minRate, minRateLonger, duration, name)
    if ( isBotInActive(name) == 0 ):
        stopBot(name)
        makeBot(name)
