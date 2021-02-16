import json
import pandas as pd
from utils import tokenize


def preprocess(data):

    all_words = []
    tags = []
    xy = []

    for index, row in data.iterrows():

        # Extract the tags.
        tag = row['tag']
        tags.append(tag)

        # Tokenize the tags.
        w = tokenize(row['pattern'])
        all_words.extend(w)

        # Include the pattern and label in the dataset.
        xy.append((w, tag))

    print(xy)

    X_train = []
    y_train = []

    return X_train, y_train


def train():

    params_file = 'params.json'
    with open(params_file) as f:
        params = json.load(f)

    FLAGS = params['FLAGS']

    if FLAGS['int'] == 0 and FLAGS['dept'] == 0 and FLAGS['cat'] == 0 and FLAGS['info'] == 0:
        print("No training done.")
        return

    if FLAGS['int'] == 1:
        return

    if FLAGS['dept'] == 1:

        # Import the data.
        file_name = params['file_dept']
        data = pd.read_csv(file_name)

        # Preprocess the data.
        X_train, y_train = preprocess(data)

        return

    if FLAGS['cat'] == 1:
        return

    if FLAGS['info'] == 0:
        return


train()