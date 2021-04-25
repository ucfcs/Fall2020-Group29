import json
import torch
import matplotlib.pyplot as plt
import torch.nn as nn
from sklearn.metrics import confusion_matrix, f1_score
from sklearn.model_selection import KFold
from dataset import preprocess
from model import NeuralNet
import numpy as np


def early_stop(params, loss_list, epoch):

    delta = params['early_stop_delta']
    patience = params['early_stop_patience']

    # Get the difference of the average losses,
    curr_avg_loss = np.mean(loss_list[epoch - patience : epoch])
    prev_avg_loss = np.mean(loss_list[epoch - (2 * patience) : epoch - patience])
    diff = prev_avg_loss - curr_avg_loss

    if diff < delta:
        return True, diff

    return False, diff


def k_fold_cross_validation(data, params, modifier, verbose=False, graphic=False):

    # Set the parameters.
    batch_size = params['batch_size']
    hidden_size = params['hidden_size']
    learning_rate = params['learning_rate']
    num_folds = params['num_folds']

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
        print("Invalid modifier.")
        return 0.0

    # Preprocess the data.
    X, y, num_classes, all_words, tags = preprocess(data)

    # Set up the number of folds for k-fold cross validation.
    kf = KFold(n_splits=num_folds, shuffle=True)

    # Set the input size.
    input_size = len(X[0])

    # Set the device to a GPU if available.
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # Set up the evaluation metrics.
    val_acc_list = []
    max_epochs_list = []

    for fold, (train_index, test_index) in enumerate(kf.split(X, y)):
        
        # Define the model.
        model = NeuralNet(input_size, hidden_size, num_classes).to(device)
        max_epochs = num_epochs

        # Set the loss function and optimizer.
        criterion = nn.CrossEntropyLoss()
        optimizer = torch.optim.Adam(model.parameters(), lr=learning_rate)

        # Set up the k-fold cross validation sets.
        X_train_fold = torch.from_numpy(X[train_index])
        y_train_fold = torch.from_numpy(y[train_index])
        X_test_fold = torch.from_numpy(X[test_index])
        y_test_fold = torch.from_numpy(y[test_index])

        # Set up the datasets and dataloaders.
        train = torch.utils.data.TensorDataset(X_train_fold, y_train_fold)
        test = torch.utils.data.TensorDataset(X_test_fold, y_test_fold)
        train_loader = torch.utils.data.DataLoader(train, batch_size=batch_size, shuffle=True)
        test_loader = torch.utils.data.DataLoader(test, batch_size=batch_size, shuffle=True)

        # Set up the evaluation metrics.
        val_loss_list = []

        for epoch in range(num_epochs):

            # Set up training mode.
            model.train()
            
            for batch_index, (X_batch, y_batch) in enumerate(train_loader):

                # Perform forward propagation.
                output = model(X_batch)
                loss = criterion(output, y_batch)

                # Perform backward propagation.
                optimizer.zero_grad()
                loss.backward()
                optimizer.step()
            
            # Calculate and save the validation metrics.
            val_output = model(X_test_fold)
            pred = torch.max(val_output.data, dim=1)[1]
            val_loss = criterion(val_output, y_test_fold).item()
            val_accuracy = (pred == y_test_fold).sum() / len(y_test_fold)
            val_loss_list.append(val_loss)

            # Check if early stopping is necessary.
            stop, diff = early_stop(params, val_loss_list, epoch)

            if stop:
                print("Stopping early!")
                max_epochs = epoch
                break
                
            # Report epoch metrics.
            print("Epoch {}/{}\tVal. Loss: {:.4f}\tVal. Accuracy: {:.2f}\tDiff: {:.4f}".format(epoch + 1, num_epochs, val_loss, val_accuracy, diff))
            
        max_epochs_list.append(max_epochs)
        val_acc_list.append(float(val_accuracy))

        # Report the model's metrics.
        print("\nFinal Validation Accuracy: {}".format(val_accuracy))
        print("Num. of Epochs for Early Stopping:", max_epochs)
        
    # Report the final metrics.
    print("\nValidation complete.")
    print("Validation Accuracies:", val_acc_list)
    print("Average Validation Accuracy: {:.2f}".format(sum(val_acc_list) / len(val_acc_list)))
    print("Num. of Epochs:", max_epochs_list)
    print("Average Num. of Epochs:", int(np.mean(max_epochs_list)))


def evaluate(verbose=False, graphic=False):

    # Load the configured parameters.
    params_file = "params.json"
    with open(params_file) as f:
        params = json.load(f)

    FLAGS = params["FLAGS"]

    val_acc_list = []
    val_loss_list = []
    val_f1_list = []
    val_conf_matrix_list - []

    if FLAGS['ints'] == 0 and FLAGS['dept'] == 0 and FLAGS['cat'] == 0 and FLAGS['info'] == 0:

        if verbose:
            print("No training required.")
        return

    if FLAGS['ints'] == 1:

        file_name = params['file_ints']
        modifier = 'ints'
        data = pd.read_csv(file_name)

        if verbose:
            print("\nPerforming Cross Validation: Intents")
        
        # Train the model.
        avg_val_acc, avg_val_loss, avg_val_f1_score, avg_val_conf_matrix = k_fold_cross_validation(data, params, modifier, verbose, graphic)

        # Save the performance metrics.
        val_acc_list.append(avg_val_acc)
        val_loss_list.append(avg_val_loss)
        val_f1_list.append(avg_val_f1_score)
        val_conf_matrix_list.append(avg_val_conf_matrix)

    if FLAGS["dept"] == 1:

        file_name = params["file_dept"]
        modifier = "dept"
        data = pd.read_csv(file_name)

        if verbose:
            print("\nPerforming Cross Validation: Departments")
        
        # Train the model.
        avg_val_acc, avg_val_loss, avg_val_f1_score, avg_val_conf_matrix = k_fold_cross_validation(data, params, modifier, verbose, graphic)

        # Save the performance metrics.
        val_acc_list.append(avg_val_acc)
        val_loss_list.append(avg_val_loss)
        val_f1_list.append(avg_val_f1_score)
        val_conf_matrix_list.append(avg_val_conf_matrix)

    if FLAGS["cat"] == 1:

        file_name = params["file_cat"]
        modifier = "cat"
        data = pd.read_csv(file_name)

        if verbose:
            print("\nPerforming Cross Validation: Categories")

        # Train the model.
        avg_val_acc, avg_val_loss, avg_val_f1_score, avg_val_conf_matrix = k_fold_cross_validation(data, params, modifier, verbose, graphic)

        # Save the performance metrics.
        val_acc_list.append(avg_val_acc)
        val_loss_list.append(avg_val_loss)
        val_f1_list.append(avg_val_f1_score)
        val_conf_matrix_list.append(avg_val_conf_matrix)

    if FLAGS["info"] == 1:

        file_name = params["file_info"]
        modifier = "info"
        data = pd.read_csv(file_name)

        if verbose:
            print("\nPerforming Cross Validation: Information")

        # Train the model.
        avg_val_acc, avg_val_loss, avg_val_f1_score, avg_val_conf_matrix = k_fold_cross_validation(data, params, modifier, verbose, graphic)

        # Save the performance metrics.
        val_acc_list.append(avg_val_acc)
        val_loss_list.append(avg_val_loss)
        val_f1_list.append(avg_val_f1_score)
        val_conf_matrix_list.append(avg_val_conf_matrix)

    # Calculate the average metrics.
    total_avg_val_acc = np.mean(val_acc_list)
    total_avg_val_loss = np.mean(val_loss_list)
    total_avg_f1_score = np.mean(val_f1_list)
    total_avg_conf_matrix = np.mean(val_conf_matrix_list)

    if verbose:
        print("\nTotal Average Cross-Validation Accuracy: {:.2f}".format(total_avg_val_acc))
        print("Total Average Cross-Validation Loss: {:.4f}".format(total_avg_val_loss))
        print("Total Average Cross-Validation F1 Score: {:.2f}".format(total_avg_f1_score))
        print("Total Average Cross-Validation Confusion Matrix:", total_avg_conf_matrix)

    return total_avg_val_acc, total_avg_val_loss, total_avg_f1_score, total_avg_conf_matrix