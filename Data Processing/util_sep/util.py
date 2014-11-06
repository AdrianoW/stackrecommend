__author__ = 'adrianowalmeida'

from datetime import datetime

def dprint(msg, time=None):
    ''' Helper function to print date before msg '''
    if not time:
        time = datetime.now()
    print '{} - {}'.format(time.strftime('%Y-%m-%d %H:%M:%S'), msg)