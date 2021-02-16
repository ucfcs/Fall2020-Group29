import json
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from dataset import ChatDataset
from model import NeuralNet
from sklearn.model_selection import train_test_split
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

    # Shuffle and split the data.
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)

    # Show the dimensionality of the data.
    print("X_train:", X_train.shape)
    print("y_train:", y_train.shape)
    print("X_test:", X_test.shape)
    print("y_test:", y_test.shape)

    num_classes = len(tags)

    return X_train, X_test, y_train, y_test, num_classes, all_words, tags


def train():

    params_file = 'params.json'
    with open(params_file) as f:
        params = json.load(f)

    FLAGS = params['FLAGS']

    if FLAGS['int'] == 0 and FLAGS['dept'] == 0 and FLAGS['cat'] == 0 and FLAGS['info'] == 0:
        print("No training done.")
        return

    if FLAGS['int'] == 1:
        file_name = params['file_int']
        return

    if FLAGS['dept'] == 1:
        file_name = params['file_dept']
        return

    if FLAGS['cat'] == 1:
        file_name = params['file_cat']
        return

    if FLAGS['info'] == 1:

        # Import the data.
        file_name = params['file_info']
        data = pd.read_csv(file_name)

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
                print(f'Epoch [{epoch+1}/{num_epochs}], Loss: {loss.item():.4f}')

        # Report the final loss.
        print(f'final loss: {loss.item():.4f}')

        # Save the model components.
        data = {
            "model_state": model.state_dict(),
            "input_size": input_size,
            "hidden_size": hidden_size,
            "num_classes": num_classes,
            "all_words": all_words,
            "tags": tags
        }

        # Save the model to "data.pth".
        FILE = "trained_model.pth"
        torch.save(data, FILE)

        # Report completion of training.
        print(f'Training complete. File saved to {FILE}.')


train()