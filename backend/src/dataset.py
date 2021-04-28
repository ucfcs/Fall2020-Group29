from flask import jsonify
import json
import numpy as np
import pandas as pd

with open("config.json") as f:
    config = json.load(f)

DEV = config["dev_mode"]

if DEV:
    from .database_manager import return_all
    from .utils import bag_of_words, lemmatize, stem, tokenize
else:
    from database_manager import return_all
    from utils import bag_of_words, lemmatize, stem, tokenize

def preprocess(data):
    """
    Preprocess the given data. Perform tokenization and stemming.

    :data: the dataset to be preprocessed.
    """

    all_words = []
    tags = []
    xy = []

    for index, row in data.iterrows():

        # Extract the tags.
        tag = row["tag"]
        tags.append(tag)

        # Tokenize the tags.
        w = tokenize(row["pattern"])
        all_words.extend(w)

        # Include the pattern and label in the dataset.
        xy.append((w, tag))

    # Set the ignore words, perform stemming, and sort.
    ignore_words = ["?", ".", "!"]
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

    num_classes = len(tags)

    # Set the training data.
    X = np.array(X)
    y = np.array(y)

    return X, y, num_classes, all_words, tags


def fetch_data(db, params):
    """
    Fetch the datasets from the given database.

    :db: the database.
    :params: the set of parameters for the model.
    """
    
    # Fetch the data from the database.
    data = return_all(db, 'questions')

    data_ints = []
    data_dept = []
    data_cat = []
    data_info = []

    # Arrange the training data.
    for q in data:
        for pattern in q['patterns']:

            # Extract the data.
            data_ints.append([q['tags'][0], pattern] )
            data_dept.append([q['tags'][1], pattern])
            data_cat.append([q['tags'][2], pattern])
            data_info.append([q['tags'][3], pattern])

    # Save training data as DataFrames.
    df_ints = pd.DataFrame(data_ints, columns =['tag', 'pattern'])
    df_dept = pd.DataFrame(data_dept, columns =['tag', 'pattern'])
    df_cat = pd.DataFrame(data_cat, columns =['tag', 'pattern'])
    df_info = pd.DataFrame(data_info, columns =['tag', 'pattern'])

    # Save training data as CSV files.
    df_ints.to_csv(params["file_ints"], index=False)
    df_dept.to_csv(params["file_dept"], index=False)
    df_cat.to_csv(params["file_cat"], index=False)
    df_info.to_csv(params["file_info"], index=False)

    return True
