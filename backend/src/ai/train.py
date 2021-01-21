import json
import numpy as np
import random
import torch
import torch.nn as nn
from model import ChatNeuralNet
from torch.utils.data import Dataset, DataLoader
from utils_nltk import bag_of_words, tokenize, stem


with open('intents.json', 'r') as f:
    intents = json.load(f)

all_words = []
tags = []
xy = []

for intent in intents['intents']:
    
    tag = intent['tag']

    tags.append(tag)
    for pattern in intent['patterns']:

        w = tokenize(pattern)
        all_words.extend(w)
        xy.append((w, tag))