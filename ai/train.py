import json
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from dataset import ChatDataset
from evaluate import evaluate
from model import NeuralNet
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import normalize
from torch.utils.data import DataLoader
from utils import bag_of_words, lemmatize, stem, tf_idf, tokenize


def preprocess(data):

    all_words = []
    tags = []
    xy = []

    for index, row in data.iterrows():

        # Extract the tags.
        tag = row['tag']
        tags.append(tag)

        # Tokenize the tags.
        w = tokenize(row['pattern'])
        all_words.extend(w)

        # Include the pattern and label in the dataset.
        xy.append((w, tag))

    # Set the ignore words, perform stemming, and sort.
    ignore_words = ['?', '.', '!']
    all_words = [stem(w) for w in all_words if w not in ignore_words]
    all_words = sorted(set(all_words))
    tags = sorted(set(tags))

    X = []
    y = []

    for (pattern, tag) in xy:

        # Set the bag of words for each pattern.
        bag = bag_of_words(pattern, all_words)
        X.append(bag)

        # Set the class labels.
        label = tags.index(tag)
        y.append(label)

    # Set the training data.
    X = np.array(X)
    y = np.array(y)

    # Normalize.
    X = normalize(X, norm='l2')

    # Shuffle and split the data.
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Show the dimensionality of the data.
    print("X_train:", X_train.shape)
    print("y_train:", y_train.shape)
    print("X_test:", X_test.shape)
    print("y_test:", y_test.shape)

    num_classes = len(tags)

    return X_train, X_test, y_train, y_test, num_classes, all_words, tags


def train_model(data, params, modifier):
    # Preprocess the data.
    X_train, X_test, y_train, y_test, num_classes, all_words, tags = preprocess(data)

    # Set the parameters.
    num_epochs = params['num_epochs']
    batch_size = params['batch_size']
    learning_rate = params['learning_rate']
    hidden_size = params['hidden_size']

    # Set the input size.
    input_size = len(X_train[0])
    print("NN Input/Output:", input_size, num_classes)

    # Set the dataset.
    dataset = ChatDataset(X_train, y_train)

    # Set the dataloader.
    train_loader = DataLoader(dataset=dataset,
                                batch_size=batch_size,
                                shuffle=True,
                                num_workers=0)

    # Set the device to a GPU if available.
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

    # Define the model.
    model = NeuralNet(input_size, hidden_size, num_classes).to(device)

    # Set the loss function and optimizer.
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=learning_rate)

    loss_list = np.zeros(num_epochs)

    for epoch in range(num_epochs):

        for (words, labels) in train_loader:

            words = words.to(device)
            labels = labels.to(dtype=torch.long).to(device)

            # Perform forward propagation.
            outputs = model(words)
            loss = criterion(outputs, labels)

            # Perform backpropagation.
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

        # Report the loss.
        if (epoch+1) % 10 == 0:
            print(f'Epoch ({epoch+1} / {num_epochs}), Loss: {loss.item():.4f}')

            loss_list[epoch] = loss

    # Report the final loss.
    print(f'final loss: {loss.item():.4f}')

    # # Plot the training loss.
    # fig = plt.figure()
    # ax = plt.axes()
    # x = np.arange(1, num_epochs + 1, 1)
    # plt.title('Loss Per Epoch')
    # ax.set_xlabel('Epoch')
    # ax.set_ylabel('Loss')
    # ax.plot(x, loss_list)
    # plt.show()

    # Evaluate the model.
    accuracy = evaluate(model, X_test, y_test, tags)

    # Save the model components.
    data = {
        "model_state": model.state_dict(),
        "input_size": input_size,
        "hidden_size": hidden_size,
        "num_classes": num_classes,
        "all_words": all_words,
        "tags": tags
    }

    # Save the model to "trained_model.pth".
    FILE = 'models/trained_model_' + modifier + '.pth'
    torch.save(data, FILE)

    # Report completion of training.
    print(f'Training complete. File saved to {FILE}.')

    return accuracy


def train():

    params_file = 'params.json'
    with open(params_file) as f:
        params = json.load(f)

    FLAGS = params['FLAGS']

    accuracies = []

    if FLAGS['int'] == 0 and FLAGS['dept'] == 0 and FLAGS['cat'] == 0 and FLAGS['info'] == 0:
        print("No training required.")
        return

    if FLAGS['int'] == 1:
        file_name = params['file_int']
        modifier = 'int'
        data = pd.read_csv(file_name)
        print("Training Intents")
        accuracy = train_model(data, params, modifier)
        accuracies.append(accuracy)

    if FLAGS['dept'] == 1:
        file_name = params['file_dept']
        modifier = 'dept'
        data = pd.read_csv(file_name)
        print("Training Entities: Departments")
        accuracy = train_model(data, params, modifier)
        accuracies.append(accuracy)

    if FLAGS['cat'] == 1:
        # Import the data.
        file_name = params['file_cat']
        modifier = 'cat'
        data = pd.read_csv(file_name)
        print("Training Entities: Categories")
        accuracy = train_model(data, params, modifier)
        accuracies.append(accuracy)

    if FLAGS['info'] == 1:
        # Import the data.
        file_name = params['file_info']
        modifier = 'info'
        data = pd.read_csv(file_name)
        print("Training Entities: Information")
        accuracy = train_model(data, params, modifier)
        accuracies.append(accuracy)

    total_accuracy = 0.0
    for i in range(len(accuracies)):
        print(accuracies[i])
        total_accuracy = total_accuracy + accuracies[i]
    model_accuracy = total_accuracy / len(accuracies)

    print("Model Accuracy:", model_accuracy)
    
train()