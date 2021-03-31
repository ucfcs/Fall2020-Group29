from torch.utils.data import Dataset
from .database_manager import return_all
import json

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
    
    raw_data = return_all(db)

    # Script to convert to CSV.

    return None