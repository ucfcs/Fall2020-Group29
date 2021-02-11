import json
import random
import torch
import matplotlib.pyplot as plt
from model import ChatNeuralNet
from utils_nltk import bag_of_words, tokenize


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
print("Tags:", tags)
model_state = data["model_state"]

# Load the trained network.
model = ChatNeuralNet(input_size, hidden_size, num_classes).to(device)
model.load_state_dict(model_state)
model.eval()

# Set the name of the chatbot and introduction.
bot_name = "Knugget"
print("It me, Knugget! Need some knugvising? (Type 'quit' to exit.)")

while True:

    # Get the input from the user.
    sentence = input("You: ")

    # Set a quit functionality.
    if sentence == "quit":
        break

    # Tokenize the input.
    sentence = tokenize(sentence)
    X = bag_of_words(sentence, all_words)
    print(sentence)
    print(X)
    X = X.reshape(1, X.shape[0])
    X = torch.from_numpy(X).to(device)

    # Predict the user intent using the network.
    output = model(X)
    print("Output:", output)

    # _, predicted = torch.max(output, dim=1)
    print("Predicted:", output)
    # print("predicted[0]", output[0][0:3])
    _, top_predictions = torch.topk(output, 3, dim=1)
    top_predictions = top_predictions.numpy()[0]
    print("Top Predictions", top_predictions)
    # _, predicted = torch.topk(output, 3, dim=1)
    # print("Numpy:", top_k.numpy()[0][0])

    probs = torch.softmax(output, dim=1)
    probs = probs.detach().numpy()[0]

    fig = plt.figure()
    ax = fig.add_axes([0,0,1,1])
    # langs = ['C', 'C++', 'Java', 'Python', 'PHP']
    # students = [23,17,35,29,12]
    ax.bar(tags,probs)
    plt.show()

    print("Probs:", probs)

    predicted_tags = []

    for i in range(probs.size):
        print(tags[i], ":", probs[i])
        if probs[i] > 0.25:
            predicted_tags.append(tags[i])

    top_tags = []

    for i in range(top_predictions.size):
        top_tags.append(tags[top_predictions[i]])

    print("Top Tags:", top_tags)
    print(predicted_tags)

    # # Tag the predictions.
    # tag = tags[predicted.item()]
    # print("Tags:", tags)
    # print("Tag:", tag)

    # Perform softmax activation on the predictions to get probabilites.
    # probs = torch.softmax(output, dim=1)
    # prob = probs[0][predicted.item()]
    # print("Probs:", probs)
    # print("Prob:", prob)

    # Get all entities with more than the set probabilities.
    # for i in range(probs.shape[0]):
    #     prob = probs[i][predicted.item()]
    #     print(prob.item())
    #     print(tag)
    #     print(tags)
    #     print(output)

    # print(prob.item())
    # for entity in tags:
    #     if probs.item() > 0.75:
    #         print(entity)

    # If the correct value is predicted, save it as the intent and respond.
    # if prob.item() > 0.75:
    #     for intent in intents['intents']:
    #         if tag == intent["tag"]:
    #             print("Entities Found:", tags)
    #             print(f"{bot_name}: {random.choice(intent['responses'])}")
    # else:
    #     print(f"{bot_name}: Sorry, I do not understand your question.")