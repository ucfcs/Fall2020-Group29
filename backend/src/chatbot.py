import json
import numpy as np
import pandas as pd
import torch

DEV = False

if DEV:
    from model import NeuralNet
    from utils import bag_of_words, tokenize
    
else:
    from .model import NeuralNet
    from .utils import bag_of_words, tokenize


def predict_tags(device, file_name, trained_model, utterance, num_predictions):
    """
    Predict the tags of the given utterance with the specified model.

    :device: specification of CPU or GPU.
    "file_name": file with the dataset.
    :trained_model: the trained model used for the predictions.
    :utterance: the utterance used for the predictions.
    :num_predictions: the number of predictions made with the utterance.
    """

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
    """
    Predict the tags for the given utterance. Calls predict_tags().

    :utterance: the utterance to be understood.
    """

    # Load the configuration.
    params_file = "params.json"
    with open(params_file) as f:
        params = json.load(f)

    predicted_tags = {}

    # Set the device to a GPU if available.
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # Open and load the intents.
    file_ints = params["file_ints"]
    file_dept = params["file_dept"]
    file_cat = params["file_cat"]
    file_info = params["file_info"]
    num_predictions = params["num_predictions"]

    tags_ints = predict_tags(
        device, file_ints, "models/trained_model_ints.pth", utterance, num_predictions
    )
    tags_dept = predict_tags(
        device, file_dept, "models/trained_model_dept.pth", utterance, num_predictions
    )
    tags_cat = predict_tags(
        device, file_cat, "models/trained_model_cat.pth", utterance, num_predictions
    )
    tags_info = predict_tags(
        device, file_info, "models/trained_model_info.pth", utterance, num_predictions
    )

    predicted_tags["ints"] = tags_ints
    predicted_tags["dept"] = tags_dept
    predicted_tags["cat"] = tags_cat
    predicted_tags["info"] = tags_info

    all_probs = [ tags_ints.get(0).get("prob"),
                  tags_dept.get(0).get("prob"),
                  tags_cat.get(0).get("prob"),
                  tags_info.get(0).get("prob") ]
    
    total_prob = np.mean(all_probs)

    predicted_tags["total_prob"] = total_prob

    return predicted_tags
