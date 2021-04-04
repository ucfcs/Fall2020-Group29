from torch.utils.data import Dataset
from .database_manager import return_all
import json
import pandas as pd
from flask import jsonify

class ChatDataset(Dataset):

    def __init__(self, X_train, y_train):
        self.n_samples = len(X_train)
        self.x_data = X_train
        self.y_data = y_train

    def __getitem__(self, index):
        return self.x_data[index], self.y_data[index]

    def __len__(self):
        return self.n_samples

def fetch_data(db, params):
    
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