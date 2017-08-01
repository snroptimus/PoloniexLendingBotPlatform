"""
WSGI config for BeeSmart project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/1.10/howto/deployment/wsgi/
"""

import os
import subprocess
import modules.bots as bots

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "BeeSmart.settings")

application = get_wsgi_application()

print("OKOK")
bots.activeSpeedBot()
#    newProcess = subprocess.Popen(["python", "/var/www/tradingbot/PoloniexLendingBotProject/PoloniexLendingBot/lendingbot_my.py", ret['apikey'], ret['secret'], str(ret['minRate']), str(ret['minRateLonger']), str(ret['duration']), Username])