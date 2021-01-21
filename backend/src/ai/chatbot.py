import json
import random
import torch
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
    X = X.reshape(1, X.shape[0])
    X = torch.from_numpy(X).to(device)

    # Predict the user intent using the network.
    output = model(X)
    _, predicted = torch.max(output, dim=1)

    # Tag the predictions.
    tag = tags[predicted.item()]

    # Perform softmax activation on the predictions to get probabilites.
    probs = torch.softmax(output, dim=1)
    prob = probs[0][predicted.item()]

    # If the correct value is predicted, save it as the intent and respond.
    if prob.item() > 0.75:
        for intent in intents['intents']:
            if tag == intent["tag"]:
                print(f"{bot_name}: {random.choice(intent['responses'])}")
    else:
        print(f"{bot_name}: Sorry, I do not understand your question.")