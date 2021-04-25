import json
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from sklearn.model_selection import train_test_split, KFold
from sklearn.preprocessing import normalize
from torch.utils.data import DataLoader

DEV = True

if DEV:
    from dataset import fetch_data, preprocess
    from model import NeuralNet
    from utils import bag_of_words, lemmatize, stem, tokenize
    
else:
    from .dataset import fetch_data, preprocess
    from .model import NeuralNet
    from .utils import bag_of_words, lemmatize, stem, tokenize


def fit(data, params, modifier, verbose=False, graphic=False):

    # Set the parameters.
    batch_size = params['batch_size']
    hidden_size = params['hidden_size']
    learning_rate = params['learning_rate']

    # Set the number of epochs.
    if modifier == 'ints':
        num_epochs = params['num_epochs_ints']
    elif modifier == 'dept':
        num_epochs = params['num_epochs_dept']
    elif modifier == 'cat':
        num_epochs = params['num_epochs_cat']
    elif modifier == 'info':
        num_epochs = params['num_epochs_info']
    else:
        if verbose:
            print("Invalid modifier.")
        return 0.0

    # Preprocess the data.
    X, y, num_classes, all_words, tags = preprocess(data)

    # Set the input size.
    input_size = len(X[0])

    # Set the device to a GPU if available.
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # Set up the evaluation metrics.
    train_loss_list = []
    train_acc_list = []

    # Define the model.
    model = NeuralNet(input_size, hidden_size, num_classes).to(device)

    # Set the loss function and optimizer.
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=learning_rate)

    X = torch.from_numpy(X)
    y = torch.from_numpy(y)

    dataset = torch.utils.data.TensorDataset(X, y)
    dataloader = torch.utils.data.DataLoader(dataset, batch_size=batch_size, shuffle=True)

    for epoch in range(num_epochs):

        # Set up training mode.
        model.train()
        
        for batch_index, (X_batch, y_batch) in enumerate(dataloader):

            # Perform forward propagation.
            output = model(X_batch)
            loss = criterion(output, y_batch)

            # Perform backward propagation.
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
        
        # Calculate and save the training metrics.
        train_loss = loss.item()
        pred = torch.max(model(X).data, dim=1)[1]
        train_accuracy = (pred == y).sum() / len(y)
        train_loss_list.append(train_loss)
        train_acc_list.append(train_accuracy)
        
        if verbose:
            # Report epoch metrics.
            print("Epoch {}/{}\tLoss: {:.4f}\tAccuracy: {:.2f}".format(epoch + 1, num_epochs, train_loss, train_accuracy))

    # Save the model components.
    data = {
        "model_state": model.state_dict(),
        "input_size": input_size,
        "hidden_size": hidden_size,
        "num_classes": num_classes,
        "all_words": all_words,
        "tags": tags,
    }

    # Save the model to "trained_model.pth".
    FILE = "models/trained_model_" + modifier + ".pth"
    torch.save(data, FILE)

    if verbose:
        # Report the final metrics.
        print("\nTraining complete. File saved to {}.".format(FILE))
        print("Final Training Loss: {:.4f}".format(train_loss_list[len(train_loss_list) - 1]))
        print("Final Training Accuracy: {:.2f}".format(train_acc_list[len(train_acc_list) - 1]))

    if graphic:
        # Plot the training loss.
        fig = plt.figure()
        ax = plt.axes()
        x = np.arange(1, num_epochs + 1, 1)
        plt.title('Loss Per Epoch')
        ax.set_xlabel('Epoch')
        ax.set_ylabel('Loss')
        ax.plot(x, train_loss_list)
        plt.show()

        # Plot the training accuracy.
        fig = plt.figure()
        ax = plt.axes()
        x = np.arange(1, num_epochs + 1, 1)
        plt.title('Training Per Epoch')
        ax.set_xlabel('Epoch')
        ax.set_ylabel('Loss')
        ax.plot(x, train_acc_list)
        plt.show()


def train(kind='manual', db=None, verbose=False, graphic=False):
    
    # Load the configured parameters.
    params_file = "params.json"
    with open(params_file) as f:
        params = json.load(f)

    # Fetch the data from the database.
    if kind == 'auto':
        fetch_data(db, params)

    FLAGS = params["FLAGS"]

    accuracies = []

    if FLAGS['ints'] == 0 and FLAGS['dept'] == 0 and FLAGS['cat'] == 0 and FLAGS['info'] == 0:

        if verbose:
            print("No training required.")
        return

    if FLAGS['ints'] == 1:

        file_name = params['file_ints']
        modifier = 'ints'
        data = pd.read_csv(file_name)

        if verbose:
            print("\nTraining Intents")
        
        # Train the model.
        fit(data, params, modifier, verbose, graphic)

    if FLAGS["dept"] == 1:

        file_name = params["file_dept"]
        modifier = "dept"
        data = pd.read_csv(file_name)

        if verbose:
            print("\nTraining Entities: Departments")
        
        # Train the model.
        fit(data, params, modifier, verbose, graphic)

    if FLAGS["cat"] == 1:

        file_name = params["file_cat"]
        modifier = "cat"
        data = pd.read_csv(file_name)

        if verbose:
            print("\nTraining Entities: Categories")

        # Train the model.
        fit(data, params, modifier, verbose, graphic)

    if FLAGS["info"] == 1:

        file_name = params["file_info"]
        modifier = "info"
        data = pd.read_csv(file_name)

        if verbose:
            print("\nTraining Entities: Information")

        # Train the model.
        fit(data, params, modifier, verbose, graphic)


if __name__ == "__main__":
    train(verbose=True, graphic=True)