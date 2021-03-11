import json
import torch
import numpy as np
import pandas as pd
from model import NeuralNet
from utils import bag_of_words, tokenize


def predict_tags(device, file_name, trained_model, utterance, num_predictions):

    # Read the data.
    data = pd.read_csv(file_name)

    # Load the network architecture.
    trained_model = torch.load(trained_model)

    # Set the network architecture.
    input_size = trained_model["input_size"]
    hidden_size = trained_model["hidden_size"]
    num_classes = trained_model["num_classes"]
    all_words = trained_model["all_words"]
    tags = trained_model["tags"]
    model_state = trained_model["model_state"]

    # Load the trained network.
    model = NeuralNet(input_size, hidden_size, num_classes).to(device)
    model.load_state_dict(model_state)
    model.eval()

    # Tokenize the input.
    utterance = tokenize(utterance)
    X = bag_of_words(utterance, all_words)
    X = X.reshape(1, X.shape[0])
    X = torch.from_numpy(X).to(device)

    # Predict the user intent using the network.
    output = model(X)
    _, top_predictions = torch.topk(output, num_predictions, dim=1)
    top_predictions = top_predictions.numpy()[0]

    # Determine the prediction probabilities.
    probs = torch.softmax(output, dim=1)
    probs = probs.detach().numpy()[0]

    all_predictions = {}

    # Get the top tags.
    for i in range(top_predictions.size):
        tag_prediction = {}
        tag_prediction["tag"] = tags[top_predictions[i]]
        tag_prediction["prob"] = probs[top_predictions[i]]
        all_predictions[i] = tag_prediction

    return all_predictions


def predict(utterance):

    # Load the configuration.
    params_file = "params.json"
    with open(params_file) as f:
        params = json.load(f)

    predicted_tags = {}

    # Set the device to a GPU if available.
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # Open and load the intents.
<<<<<<< HEAD:backend/src/ai/chatbot.py
    file_dept = params["file_dept"]
    file_cat = params["file_cat"]
    file_info = params["file_info"]

    tags_dept = predict_tags(
        device, file_dept, "models/trained_model_dept.pth", utterance
    )
    tags_cat = predict_tags(device, file_cat, "models/trained_model_cat.pth", utterance)
    tags_info = predict_tags(
        device, file_info, "models/trained_model_info.pth", utterance
    )

    predicted_tags["dept"] = tags_dept
    predicted_tags["cat"] = tags_cat
    predicted_tags["info"] = tags_info

    return predicted_tags
=======
    file_ints = params['file_ints']
    file_dept = params['file_dept']
    file_cat = params['file_cat']
    file_info = params['file_info']
    num_predictions = params['num_predictions']

    tags_ints = predict_tags(device, file_ints, 'models/trained_model_ints.pth', utterance, num_predictions)
    tags_dept = predict_tags(device, file_dept, 'models/trained_model_dept.pth', utterance, num_predictions)
    tags_cat = predict_tags(device, file_cat, 'models/trained_model_cat.pth', utterance, num_predictions)
    tags_info = predict_tags(device, file_info, 'models/trained_model_info.pth', utterance, num_predictions)

    predicted_tags['ints'] = tags_ints
    predicted_tags['dept'] = tags_dept
    predicted_tags['cat'] = tags_cat
    predicted_tags['info'] = tags_info
>>>>>>> main:ai/chatbot.py

