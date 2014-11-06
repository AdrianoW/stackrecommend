from datetime import datetime
import requests
import pandas as pd
import time
import json
from math import ceil
from util_sep.util import dprint
from time import sleep


class StackOverflowUser():
    '''
    Handles fetching the contents of Stack Overflow related to the user
    '''
    def __init__(self):
        self.user_id = 0

    def get_user_code_by_name(self):
        pass


class StackSite():
    '''
    Wrapper to the s.o. calls
    '''
    def __init__(self):
        '''
        read the app key from the file
        '''
        with open('app.key') as f:
            self.app_key = json.load(f)

        # url helpers
        self.site = '&site=stackoverflow'
        self.key = '&key=' + self.app_key['key']
        self.suffix = self.site+self.key
        self.prefix = 'http://api.stackexchange.com/2.2/'

    def get_users_tags(self, p_client_list=None, p_amount=100,
                       first_client=1, cli_amount=100):
        '''
        Get the users tags. A list of user can be passed or a list of
        sequencial ids can be generated as the list of users.

        Params:
            :p_client_list(list, optional): list of users
            :p_amount(int, optional): the number of users to be brought
            :first_client(int, optional): first id to be generated
            :cli_amount(int, optional): number of ids to be generated
        '''
        # create the url
        url = self.prefix+'users/{}/tags?order=desc&sort=popular'+self.suffix

        # users list
        id_str = ''
        if not p_client_list:
            p_client_list = range(first_client, first_client+cli_amount)
        for i in p_client_list:
            id_str += str(i) + ';'
        id_str = id_str[:-1]
        url = url.format(id_str)

        # get info
        return self.get_all_rows(url, p_amount)

    def get_users(self, p_sort=0, p_amount=1000, p_page=0):
        '''
        Get users ordered by a principle passed as a parameter

        Params:
            :sort(int, optional): a number that represent one of the orders:
                [reputation, creation, name, modified]
            :amount(int, optional): amount of users to get. Multiple of 1000
        '''

        # create the url
        url = self.prefix+'users/?order=desc&sort={}'+self.suffix
        order = ['reputation', 'creation', 'name', 'modified']
        url = url.format(order[p_sort])

        # get info
        return self.get_all_rows(url, p_amount, p_page=p_page)

    def get_all_rows(self, p_url, p_amount, p_pagesize=100, p_verbose=True, p_page=0 ):
        '''
        Fetch all rows. Takes care of the 30 call per second and the backoff
        command send by SO

        :param
        :p_url(str): the url that will be called over and over.
            It should not contain page param, as it will be appended
        :p_amount(int): the amount of information (rows) that should be
            retrieved
        :p_pagesize(int, optional): the amount of info that will be fetch in
            each page.
        :return: dataframe with info
        '''
        # initial info
        page_size = '&pagesize='+str(p_pagesize)
        init_page = p_page
        page = p_page

        # while there is data
        first = True
        ret = None
        quota = 0
        while True:
            t1 = datetime.now()
            response = requests.get(p_url+page_size+'&page='+str(page+1))
            d= response.json()
            if first:
                ret = pd.DataFrame(d['items'])
                first = not first
            else:
                ret = pd.concat([ret,pd.DataFrame(d['items'])])
            quota = d['quota_remaining']

            # check if there is more
            if d['has_more']:
                # check if there is a limit and it if was broken
                if p_amount and (ceil(p_amount/100.0)+init_page) <= page:
                    break
                page += 1
                dprint('Going to page %d' %page)
                t2 = datetime.now()

                # if it was quickier than 1/30 seconds, wait to call again
                delta = (t2 - t1)
                if (delta.microseconds < 34.000):
                    time.sleep( (1/30.0) - delta.microseconds*1000)

                # check if there was the backoff message and wait
                if d.has_key('backoff'):
                    dprint('Backing off %d' %d['backoff'])
                    time.sleep(d['backoff'])
            else:
                break

        if p_verbose:
            dprint('Quota_remaining: %d' %quota)

        return ret



