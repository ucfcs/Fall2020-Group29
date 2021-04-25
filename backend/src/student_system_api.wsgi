#!/usr/bin/python
import sys 
import logging
logging.basicConfig(stream=sys.stderr)
sys.path.insert(0, '/var/www/ucf-ai-advising-chatbot/backend/src')
from student_system_api import app as application
application.secret_key = "9A4725BD-0372-11E6-9614-507B9DE7AD01"