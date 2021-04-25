from flask import jsonify
import json
import numpy as np
import pandas as pd

DEV = True

if DEV:
    from utils import bag_of_words, lemmatize, stem, tokenize
    
else:
    from .utils import bag_of_words, lemmatize, stem, tokenize


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
    raw_data = jsonify(return_all(db))

    data_ints = []
    data_dept = []
    data_cat = []
    data_info = []

    # Arrange the training data.
    with open(raw_data) as json_file:

        data = json.load(json_file)

        for p in data['questions']:
            for pattern in p['patterns']:

                # Extract the data.
                data_ints.append([pattern, p['tags'][0]])
                data_dept.append([pattern, p['tags'][1]])
                data_cat.append([pattern, p['tags'][2]])
                data_info.append([pattern, p['tags'][3]])

    # Save training data as DataFrames.
    df_ints = pd.DataFrame(data_ints, columns =['pattern', 'tag'])
    df_dept = pd.DataFrame(data_dept, columns =['pattern', 'tag'])
    df_cat = pd.DataFrame(data_cat, columns =['pattern', 'tag'])
    df_info = pd.DataFrame(data_info, columns =['pattern', 'tag'])

    # Save training data as CSV files.
    df_ints.to_csv(params["file_ints"])
    df_dept.to_csv(params["file_dept"])
    df_cat.to_csv(params["file_cat"])
    df_info.to_csv(params["file_info"])

    return True