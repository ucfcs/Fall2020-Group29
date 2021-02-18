import torch
import torch.nn as nn


class NeuralNet(nn.Module):

    def __init__(self, in_size, hidden_size, num_classes):

        super(NeuralNet, self).__init__()
        self.l1 = nn.Linear(in_size, hidden_size) 
        self.l2 = nn.Linear(hidden_size, hidden_size) 
        self.l3 = nn.Linear(hidden_size, num_classes)
        self.relu = nn.ReLU()

    def forward(self, X):

        X = self.l1(X)
        X = self.relu(X)
        X = self.l2(X)
        X = self.relu(X)
        X = self.l3(X)
        return X