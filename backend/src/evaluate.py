import json
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sn
import torch
import torch.nn as nn
from sklearn.metrics import confusion_matrix, f1_score
from sklearn.model_selection import KFold

with open("config.json") as f:
    config = json.load(f)

DEV = config["dev_mode"]

if DEV:
    from .dataset import preprocess
    from .model import NeuralNet
else:
    from dataset import preprocess
    from model import NeuralNet


def early_stop(params, loss_list, epoch):
    """
    Checks if a model should stop early during training.

    :params: set of parameters for the model.
    :loss_list: current list of loss values for the model.
    :epoch: the current epoch.
    """

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
    """
    Perform k-fold cross-validation for the models given the training data.

    :data: data to train and validate the model. 
    :params: set of parameters for the model.
    :modifier: name of the model.
    :verbose: parameter to show training progress in the terminal.
    :graphic: parameter to show training performance curves.
    """

    # Set the parameters.
    batch_size = params['batch_size']
    hidden_size = params['hidden_size']
    learning_rate = params['learning_rate']
    num_folds = params['num_folds']
    num_epochs = params['max_epochs']

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
    val_loss_list = []
    max_epochs_list = []
    f1_list = []
    conf_matrix_list = []
    top_acc = 0.0

    for fold, (train_index, test_index) in enumerate(kf.split(X, y)):
        
        # Define the model.
        model = NeuralNet(input_size, hidden_size, num_classes).to(device)
        max_epochs = num_epochs

        # Set the loss function and optimizer.
        criterion = nn.CrossEntropyLoss()
        optimizer = torch.optim.Adam(model.parameters(), lr=learning_rate)

        # Set up the k-fold cross validation sets.
        X_train_fold = torch.from_numpy(X[train_index])
        y_train_fold = torch.from_numpy(y[train_index]).type(torch.LongTensor)
        X_test_fold = torch.from_numpy(X[test_index])
        y_test_fold = torch.from_numpy(y[test_index]).type(torch.LongTensor)

        # Set up the datasets and dataloaders.
        train = torch.utils.data.TensorDataset(X_train_fold, y_train_fold)
        test = torch.utils.data.TensorDataset(X_test_fold, y_test_fold)
        train_loader = torch.utils.data.DataLoader(train, batch_size=batch_size, shuffle=True)
        test_loader = torch.utils.data.DataLoader(test, batch_size=batch_size, shuffle=True)

        # Set up the evaluation metrics.
        fold_val_loss_list = []

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
            fold_val_loss = criterion(val_output, y_test_fold).item()
            val_accuracy = (pred == y_test_fold).sum() / len(y_test_fold)
            fold_val_loss_list.append(fold_val_loss)

            # Save the best prediction.
            if val_accuracy > top_acc:
                top_acc = val_accuracy
                top_y_pred = pred
                top_y_true = y_test_fold

            # Check if early stopping is necessary.
            stop, diff = early_stop(params, fold_val_loss_list, epoch)

            if stop:
                if verbose:
                    print("Stopping early!")
                max_epochs = epoch
                break
                
            if verbose:
                # Report epoch metrics.
                print("Epoch {}/{}\tVal. Loss: {:.4f}\tVal. Accuracy: {:.2f}\tDiff: {:.4f}".format(epoch + 1, num_epochs, fold_val_loss, val_accuracy, diff))
            
        # Calculate the F1 score and confusion matrix.
        f1 = f1_score(top_y_true, top_y_pred, average='macro')
        confusion = confusion_matrix(top_y_true, top_y_pred)
        
        # Save the values in their appropriate lists.
        max_epochs_list.append(max_epochs)
        val_acc_list.append(float(val_accuracy))
        val_loss_list.append(fold_val_loss_list[max_epochs - 1])
        f1_list.append(f1)
        conf_matrix_list.append(confusion)

        if verbose:
            # Report the model's metrics.
            print("\nFinal Validation Accuracy: {}".format(val_accuracy))
            print("Num. of Epochs for Early Stopping:", max_epochs)
            print("F1 Score:", f1)
            print("Confusion Matrix:", confusion)

    # Get the best fold.
    best_fold = np.argmax(val_acc_list)
    val_conf_matrix = conf_matrix_list[best_fold]

    # Compute the average performance metrics.
    avg_val_acc = np.mean(val_acc_list)
    avg_val_loss = np.mean(val_loss_list)
    avg_num_epochs = int(np.mean(max_epochs_list))
    avg_val_f1_score = np.mean(f1_list)
        
    if verbose:
        # Report the final metrics.
        print("\nValidation complete.")
        print("Validation Accuracies:", val_acc_list)
        print("Validation Losses:", val_loss_list)
        print("F1 Scores:", f1_list)
        print("Average Validation Accuracy: {:.2f}".format(avg_val_acc))
        print("Average Validation Loss: {:.4f}".format(avg_val_loss))
        print("Num. of Epochs:", max_epochs_list)
        print("Average Num. of Epochs:", avg_num_epochs)
        print("Averave F1 Score:", avg_val_f1_score)
        print("Best Confusion Matrix:", val_conf_matrix)

    return avg_val_acc, avg_val_loss, avg_num_epochs, avg_val_f1_score, val_conf_matrix


def evaluate(verbose=False, graphic=False):
    """
    Sets up the cross-validation loop and validates the models,
    automatically updating the number of epochs for training
    using early stopping. Returns the average validation accuracy,
    loss, and F1 score.

    :verbose: parameter to show training progress in the terminal.
    :graphic: parameter to show training performance curves.
    """

    # Load the configured parameters.
    params_file = "params.json"
    with open(params_file) as f:
        params = json.load(f)

    FLAGS = params["FLAGS"]
    new_params = params

    val_acc_list = []
    val_loss_list = []
    val_f1_list = []
    val_conf_matrix_list = []
    num_epochs_list = []

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
        avg_val_acc, avg_val_loss, avg_num_epochs, avg_val_f1_score, val_conf_matrix = k_fold_cross_validation(data, params, modifier, verbose, graphic)

        # Save the performance metrics.
        val_acc_list.append(avg_val_acc)
        val_loss_list.append(avg_val_loss)
        val_f1_list.append(avg_val_f1_score)
        val_conf_matrix_list.append(val_conf_matrix)
        num_epochs_list.append(avg_num_epochs)

        # Update the number of epochs.
        new_params['num_epochs_ints'] = avg_num_epochs

    if FLAGS["dept"] == 1:

        file_name = params["file_dept"]
        modifier = "dept"
        data = pd.read_csv(file_name)

        if verbose:
            print("\nPerforming Cross Validation: Departments")
        
        # Train the model.
        avg_val_acc, avg_val_loss, avg_num_epochs, avg_val_f1_score, val_conf_matrix = k_fold_cross_validation(data, params, modifier, verbose, graphic)

        # Save the performance metrics.
        val_acc_list.append(avg_val_acc)
        val_loss_list.append(avg_val_loss)
        val_f1_list.append(avg_val_f1_score)
        val_conf_matrix_list.append(val_conf_matrix)
        num_epochs_list.append(avg_num_epochs)

        # Update the number of epochs.
        new_params['num_epochs_dept'] = avg_num_epochs

    if FLAGS["cat"] == 1:

        file_name = params["file_cat"]
        modifier = "cat"
        data = pd.read_csv(file_name)

        if verbose:
            print("\nPerforming Cross Validation: Categories")

        # Train the model.
        avg_val_acc, avg_val_loss, avg_num_epochs, avg_val_f1_score, val_conf_matrix = k_fold_cross_validation(data, params, modifier, verbose, graphic)

        # Save the performance metrics.
        val_acc_list.append(avg_val_acc)
        val_loss_list.append(avg_val_loss)
        val_f1_list.append(avg_val_f1_score)
        val_conf_matrix_list.append(val_conf_matrix)
        num_epochs_list.append(avg_num_epochs)

        # Update the number of epochs.
        new_params['num_epochs_cat'] = avg_num_epochs

    if FLAGS["info"] == 1:

        file_name = params["file_info"]
        modifier = "info"
        data = pd.read_csv(file_name)

        if verbose:
            print("\nPerforming Cross Validation: Information")

        # Train the model.
        avg_val_acc, avg_val_loss, avg_num_epochs, avg_val_f1_score, val_conf_matrix = k_fold_cross_validation(data, params, modifier, verbose, graphic)

        # Save the performance metrics.
        val_acc_list.append(avg_val_acc)
        val_loss_list.append(avg_val_loss)
        val_f1_list.append(avg_val_f1_score)
        val_conf_matrix_list.append(val_conf_matrix)
        num_epochs_list.append(avg_num_epochs)

        # Update the number of epochs.
        new_params['num_epochs_info'] = avg_num_epochs

    # Calculate the average metrics.
    total_avg_val_acc = np.mean(val_acc_list)
    total_avg_val_loss = np.mean(val_loss_list)
    total_avg_f1_score = np.mean(val_f1_list)

    if verbose:
        print("\nTotal Average Cross-Validation Accuracy: {:.2f}".format(total_avg_val_acc))
        print("Total Average Cross-Validation Loss: {:.4f}".format(total_avg_val_loss))
        print("Total Average Cross-Validation F1 Score: {:.2f}".format(total_avg_f1_score))

        for i in range(len(val_conf_matrix_list)):
            print("Confusion Matrix #{}:\n{}".format(i + 1, val_conf_matrix_list[i]))

    # Update the params.json file.
    with open("params.json", "w") as write_file:
        json.dump(new_params, write_file, indent=4)

    if verbose:
        print("\nEpochs for each model updated.")
        print("New Epochs:", num_epochs_list)

    if graphic:

        # Plot the confusion matrices.
        for i in range(len(val_conf_matrix_list)):
            df_cm = pd.DataFrame(val_conf_matrix_list[i])
            plt.figure(figsize = (10,7))
            sn.heatmap(df_cm, annot=True)
            plt.show()

    return total_avg_val_acc, total_avg_val_loss, total_avg_f1_score


if __name__ == "__main__":
    evaluate(verbose=True, graphic=True)