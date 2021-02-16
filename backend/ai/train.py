import json
import pandas as pd
from utils import tokenize


def preprocess(data):

    all_words = []
    tags = []
    xy = []

    for index, row in data.iterrows():
        tag = row['tag']
        tags.append(tag)
        w = tokenize(row['pattern'])
        all_words.extend(w)
        xy.append((w, tag))

    X_train = []
    y_train = []

    return X_train, y_train


def train(FLAGS):

    params_file = 'params.json'
    with open(params_file) as f:
        params = json.load(f)

    FLAGS = params['FLAGS']

    if FLAGS.int & FLAGS.dept & FLAGS.cat & FLAGS.info == False:
        print("No training done.")
        return

    if FLAGS.int == True:
        return

    if FLAGS.dept == True:

        # Import the data.
        file_name = params['file_dept']
        data = pd.read_csv(file_name)

        print(file_name)
        print(data)

        # Preprocess the data.
        # X_train, y_train = preprocess(data)

        return

    if FLAGS.cat == True:
        return

    if FLAGS.info == True:
        return


