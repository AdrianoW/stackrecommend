__author__ = 'adrianowalmeida'

import pandas as pd
import cPickle


class Models(object):
    '''
    Hold the models of our machine learning algorithm. New models should be
    implemented here
    '''

    def __init__(self):
        '''
        read all the models
        :return:
        '''
        # load the models
        with open('Data/MiniBatchKmodel.pck') as f_pick:
            self.modelMinKBatch = cPickle.load(f_pick)

        # read the group files
        self.group_Kmeans = pd.read_csv('Data/miniBatchKUserGroup.csv')
        #import pdb; pdb.set_trace()
        self.group_Kmeans.set_index(['label'], inplace=True)

        # read the features list
        self.header = pd.read_csv('Data/featuresList.csv')

        # model names
        self. modelNames = [
            'KMeansBatch'
        ]

    def construct_client_vector(self, tags_dict):
        '''
        Contructs a valid cursor to be used on the predict
        :param tags_dict: tags and values they have like a json
        {'python': 3, 'skimage':1, 'javascript':1, 'pandas':1}
        :return: pandas dataframe
        '''
        # create a dummy data table and let only the tags that exist prediction
        new_user = pd.DataFrame(tags_dict, index=[0])
        exist = new_user[new_user.columns.intersection(self.header.columns)]
        new_df = pd.concat([self.header, exist]).fillna(0)

        # normalize the user info
        total_tags_count_user = new_df.sum(axis=1)
        total_tags_count_user.name='total'
        new_df_normal = new_df.mul(100, axis=0).div(total_tags_count_user, axis=0)

        return new_df_normal

    def predict_client_group(self, df_client_info, model):
        '''
        Predict what is the user group
        :param df_client_info: dataframe with client info, normalized and with
            the fields in the same order of the training model
        :return: client group
        '''
        if model == 'KMeansBatch':
            return self.modelMinKBatch.predict(df_client_info)
        else:
            return None

    def get_group_users(self, group_label):
        '''
        fetch all the users for the specific label
        :param group_label:
        :return: list of users on the smae group
        '''
        return list(self.group_Kmeans.query('label =='+str(group_label[0]))['user_id'])

models = Models()
