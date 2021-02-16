import json
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from utils import bag_of_words, lemmatize, stem, tf_idf, tokenize


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

    # Set the ignore words, perform stemming, and sort.
    ignore_words = ['?', '.', '!']
    all_words = [stem(w) for w in all_words if w not in ignore_words]
    all_words = sorted(set(all_words))
    tags = sorted(set(tags))

    X = []
    y = []

    for (pattern, tag) in xy:

        # Set the bag of words for each pattern.
        bag = bag_of_words(pattern, all_words)
        X.append(bag)

        # Set the class labels.
        label = tags.index(tag)
        y.append(label)

    # Set the training data.
    X = np.array(X)
    y = np.array(y)

    # Shuffle and split the data.
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)

    # Show the dimensionality of the data.
    print("X_train:", X_train.shape)
    print("y_train:", y_train.shape)
    print("X_test:", X_test.shape)
    print("y_test:", y_test.shape)

    return X_train, X_test, y_train, y_test


def train():

    params_file = 'params.json'
    with open(params_file) as f:
        params = json.load(f)

    FLAGS = params['FLAGS']

    if FLAGS['int'] == 0 and FLAGS['dept'] == 0 and FLAGS['cat'] == 0 and FLAGS['info'] == 0:
        print("No training done.")
        return

    if FLAGS['int'] == 1:
        file_name = params['file_int']
        return

    if FLAGS['dept'] == 1:
        file_name = params['file_dept']
        return

    if FLAGS['cat'] == 1:
        file_name = params['file_cat']
        return

    if FLAGS['info'] == 1:

        # Import the data.
        file_name = params['file_info']
        data = pd.read_csv(file_name)

        # Preprocess the data.
        X_train, X_test, y_train, y_test = preprocess(data)

        return

train()