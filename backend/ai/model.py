import torch
import torch.nn as nn


class ChatNeuralNet(nn.Module):

    def __init__(self, in_size, hidden_size, num_classes):
        """
        Defines the architecture of the neural network according to the parameters. This
        design uses one hidden layer.

        :in_size: the number of nodes in the input layer.
        :hidden_size: the number of nodes in the hidden layer.
        :num_classes: the number of classes for the output layer.
        """

        super(ChatNeuralNet, self).__init__()
        self.l1 = nn.Linear(in_size, hidden_size) 
        self.l2 = nn.Linear(hidden_size, hidden_size) 
        self.l3 = nn.Linear(hidden_size, num_classes)
        self.relu = nn.ReLU()

    def forward(self, X):
        """
        Performs forward propagation through the neural network.
        
        :X: the current state of the neural network.
        """

        X = self.l1(X)
        X = self.relu(X)
        X = self.l2(X)
        X = self.relu(X)
        X = self.l3(X)
        return X