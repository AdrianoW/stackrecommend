__author__ = 'adrianowalmeida'
'''
Machine learning script.

Only loads saved files, apply the machine learning part and spit a usable model

'''
import sys
import pandas as pd
import cPickle
from sklearn.cluster import MiniBatchKMeans
from util_sep.util import dprint
import shutil
import glob
from os import path

VERBOSE = True

def create_model(type_model=1,
                 input_file = '../Data/Processed/model_input.csv',
                 generate_user_group = True,
                 out_format = ['json', 'csv']
                 ):
    # read the input file, redo the index by id
    if VERBOSE:
        dprint('Reading file {}'.format(input_file))
    inFile = pd.read_csv(input_file)
    inFile.set_index(['user_id'], inplace=True)

    # normalize the data
    if VERBOSE:
        dprint('Normalizing data')
    total_tags_count_user = inFile.sum(axis=1)
    total_tags_count_user.name='total'
    top_tags_wide_normal = inFile.mul(100, axis=0).div(total_tags_count_user,
                                                       axis=0)
    # learn according to the options choosen
    if type_model==1:
        if VERBOSE:
            dprint('Generating Mini Batch K Means')

        model = MiniBatchKMeans(n_clusters = 250, reassignment_ratio = 1)
        ret = model.fit(top_tags_wide_normal)

        # save the model in a pickle
        output = 'output/MiniBatchKmodel.pck'
        with open(output, 'w') as f:
            if VERBOSE:
                dprint('Saving to file {}'.format(output))
            cPickle.dump(model, f, -1)

        # generate the training headers
        output = 'output/featuresList.csv'
        with open(output, 'w') as f:
            if VERBOSE:
                dprint('Writing features (columns) to {}'.format(output))
            cols = top_tags_wide_normal.columns
            f.write(','.join(cols))

        if generate_user_group:
            if VERBOSE:
                dprint('Generating userID/Group files')
            mbk_means_labels = ret.labels_
            group_users = top_tags_wide_normal.copy()
            group_users['label'] = mbk_means_labels

            # extract only the info that interests us - user group and id
            # has to reset index to get user_id
            fields = ['user_id', 'label']
            export_group = group_users.reset_index()[fields]

            if 'json' in out_format:
                out = 'output/miniBatchKUserGroup.json'
                if VERBOSE:
                    dprint('Generating file {}'.format(out))
                export_group.to_json(out)

            if 'csv' in out_format:
                out = 'output/miniBatchKUserGroup.csv'
                if VERBOSE:
                    dprint('Generating file {}'.format(out))
                export_group.to_csv(out, index=False)


def copy_files_to_web(web_dir = '../Site/Python/Data'):
    # copy all files to a model web dir
    file_list = glob.glob('output/*.*')
    for file in file_list:
        if VERBOSE:
            dprint('Copying file {}'.format(file))
        f_name = path.basename(file)
        shutil.copyfile(file, path.join(web_dir, f_name))


def _usage_and_exit():
    print "Usage: {} function-name [arg1 [arg2 ...]]".format(sys.argv[0])
    sys.exit(0)


if __name__ == '__main__':
    if len(sys.argv) == 1:
        _usage_and_exit()

    func = globals().get(sys.argv[1])
    if func is None:
        _usage_and_exit()

    func(*sys.argv[2:])