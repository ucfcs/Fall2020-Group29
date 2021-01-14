import torch
import torch.nn as nn


class ChatNeuralNet(nn.Module):

    def __init__(self, in_size, hidden_size, num_classes):
        super(ChatNeuralNet, self).__init__()
        self.l1 = nn.Linear(in_size, hidden_size) 
        self.l2 = nn.Linear(hidden_size, hidden_size) 
        self.l3 = nn.Linear(hidden_size, num_classes)