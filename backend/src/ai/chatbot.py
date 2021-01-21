import json
import random
import torch
from model import NeuralNet
from utils_nltk import bag_of_words, tokenize


device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')