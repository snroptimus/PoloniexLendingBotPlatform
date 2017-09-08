import time 
import threading
import subprocess
import psutil
from modules.models import *

def isBotInActive(Username, exchange):
    ret = Bots.getBotParam(Username)
    pid = 0
    print(ret)

    if ( exchange == "Poloniex" ):
        pid = ret['polopid']
    elif ( exchange == "Bitfinex"):
        pid = ret['bitpid']

    print(pid)
    if ( pid == -1 ):    
        return 1
    else:
        if psutil.pid_exists(pid):
            return 0
        else:
            return 1

def activeSpeedBot():
    pass
#   Change Path
    '''
    subprocess.Popen(["python", "/Volumes/Backup/workspace/Rio(Python_Crypto_Lending_Bot)/poloniexlendingbot/lending_speed.py"])
    subprocess.Popen(["python", "/Volumes/Backup/workspace/Rio(Python_Crypto_Lending_Bot)/Bitfinexlendingbot/lending_speed.py"])
    '''
    '''
    subprocess.Popen(["python", "/var/www/tradingbot/PoloniexLendingBotProject/PoloniexLendingBot/lending_speed.py"])
    subprocess.Popen(["python", "/var/www/tradingbot/PoloniexLendingBotProject/BitfinexLendingBot/lending_speed.py"])
    '''

def activateBot(Username, exchange):
    ret = Bots.getBotParam(Username)

    print("Bot Start")
#   Change Path
    '''
    if ( exchange == "Poloniex"):
        newProcessPolo = subprocess.Popen(["python", "/Volumes/Backup/workspace/Rio(Python_Crypto_Lending_Bot)/poloniexlendingbot/lendingbot_my.py", ret['poloapikey'], ret['polosecret'], str(ret['polominRate']), str(ret['polominRateLonger']), str(ret['poloduration']), Username])
        Bots.setPID(Username, newProcessPolo.pid, exchange)
    elif ( exchange == "Bitfinex"):
        newProcessBit = subprocess.Popen(["python", "/Volumes/Backup/workspace/Rio(Python_Crypto_Lending_Bot)/Bitfinexlendingbot/lendingbot_my.py", ret['bitapikey'], ret['bitsecret'], str(ret['bitminRate']), str(ret['bitminRateLonger']), str(ret['bitduration']), Username])
        Bots.setPID(Username, newProcessBit.pid, exchange)
    '''
    if ( exchange == "Poloniex"):
        print("Poloniex Bot Start:")
        newProcessPolo = subprocess.Popen(["python", "/var/www/tradingbot/PoloniexLendingBotProject/PoloniexLendingBot/lendingbot_my.py", ret['poloapikey'], ret['polosecret'], str(ret['polominRate']), str(ret['polominRateLonger']), str(ret['poloduration']), Username])
        Bots.setPID(Username, newProcessPolo.pid, exchange)
    elif ( exchange == "Bitfinex"):
        print("Bitfinex Bot Start:")
        newProcessBit = subprocess.Popen(["python", "/var/www/tradingbot/PoloniexLendingBotProject/BitfinexLendingBot/lendingbot_my.py", ret['bitapikey'], ret['bitsecret'], str(ret['bitminRate']), str(ret['bitminRateLonger']), str(ret['bitduration']), Username])
        Bots.setPID(Username, newProcessBit.pid, exchange)
    
    
def makeBot(Username, exchange):
    """
    thread = threading.Thread(target=startBot, kwargs={'id': tID})
    thread.deamon = True
    print(thread.getName())
    thread.start()
    """
    if ( isBotInActive(Username, exchange) == 1 ):
        print("activing_bot")
        activateBot(Username, exchange)
        return 1
    else:
        return 0

def stopBot(Username, exchange):
    ret = Bots.getBotParam(Username)

    pid = 0

    if ( exchange == "Poloniex" ):
        pid = ret['polopid']
    elif ( exchange == "Bitfinex"):
        pid = ret['bitpid']

    print("Stop")
    if ( isBotInActive(Username, exchange) == 0 ):
        if psutil.pid_exists(pid):
            p = psutil.Process(pid)
            p.terminate()
            Bots.setPID(Username, -1, exchange)

def setBotLendParam(minRate, minRateLonger, duration, name, exchange):
    Bots.setLendParam(minRate, minRateLonger, duration, name, exchange)
    if ( isBotInActive(name, exchange) == 0 ):
        stopBot(name, exchange)
        makeBot(name, exchange)
