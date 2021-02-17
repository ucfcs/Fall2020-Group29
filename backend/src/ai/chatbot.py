import json
import torch
import numpy as np
from model import ChatNeuralNet
from utils_nltk import bag_of_words, tokenize


def get_entities(input):

    # Set the device to a GPU if available.
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

    # Open and load the intents.
    with open('intents_testing.json', 'r') as json_data:
        intents = json.load(json_data)

    # Load the network architecture.
    FILE = "data.pth"
    data = torch.load(FILE)

    # Set the network architecture.
    input_size = data["input_size"]
    hidden_size = data["hidden_size"]
    num_classes = data["num_classes"]
    all_words = data['all_words']
    tags = data['tags']
    model_state = data["model_state"]

    # Load the trained network.
    model = ChatNeuralNet(input_size, hidden_size, num_classes).to(device)
    model.load_state_dict(model_state)
    model.eval()

    # Tokenize the input.
    sentence = tokenize(input)
    X = bag_of_words(sentence, all_words)
    X = X.reshape(1, X.shape[0])
    X = torch.from_numpy(X).to(device)

    # Predict the user intent using the network.
    output = model(X)
    _, top_predictions = torch.topk(output, 3, dim=1)
    top_predictions = top_predictions.numpy()[0]

    # Determine the prediction probabilities.
    probs = torch.softmax(output, dim=1)
    probs = probs.detach().numpy()[0]

    top_tags = []

    # Get the top tags.
    for i in range(top_predictions.size):
        top_tags.append(tags[top_predictions[i]])

    return top_tags