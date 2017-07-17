"""BeeSmart URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.10/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import include, url
from django.contrib import admin

from modules.views import login
from modules.views import register
from modules.views import confirm
from modules.views import chksamename
from modules.views import setParam
from modules.views import setKey
from modules.views import startBot
from modules.views import stopBot
from modules.views import sendBotLog
from modules.views import getbotInfo

from modules.views import LoginView
from modules.views import IndexView
from modules.views import GraphView
from modules.views import SettingsView
from modules.views import AboutView
from modules.views import HelpView
from modules.views import VerifyView

urlpatterns = [
    url(r'^$', LoginView.as_view()),

    url(r'^home/', IndexView.as_view(), name='home'),
    url(r'^graph/', GraphView.as_view()),
    url(r'^settings/', SettingsView.as_view()),
    url(r'^about/', AboutView.as_view()),
    url(r'^help/', HelpView.as_view()),
    url(r'^verify', VerifyView.as_view()),
    url(r'^admin/', admin.site.urls),

    url(r'^login', login),
    url(r'^register', register),    
    url(r'^confirm', confirm),
    url(r'^chksamename', chksamename),
    url(r'^setParam', setParam),
    url(r'^setKey', setKey),
    url(r'^startBot', startBot),
    url(r'^stopBot', stopBot),
    url(r'^botlog', sendBotLog),
    url(r'^botInfo', getbotInfo),
]
