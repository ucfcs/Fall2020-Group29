import json
import pandas as pd
from utils import bag_of_words, lemmatize, stem, tokenize


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

    X_train = []
    y_train = []

    for (pattern, tag) in xy:

        # Set the bag of words for each pattern.
        bag = bag_of_words(pattern, all_words)
        X_train.append(bag)

        # Set the class labels.
        label = tags.index(tag)
        y_train.append(label)

    # Set the training data.
    X_train = np.array(X_train)
    y_train = np.array(y_train)

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
        X_train, y_train = preprocess(data)

        return

train()