import json
import torch
import matplotlib.pyplot as plt
import torch.nn as nn
from sklearn.metrics import confusion_matrix, f1_score
from sklearn.model_selection import KFold
from dataset import preprocess
from model import NeuralNet
import numpy as np

def k_fold_cross_validation(data, params, modifier):

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
    val_loss_list = []
    val_acc_list = []

    for fold, (train_index, test_index) in enumerate(kf.split(X, y)):

        # Define the model.
        model = NeuralNet(input_size, hidden_size, num_classes).to(device)

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
            pred = torch.max(model(X_test_fold).data, dim=1)[1]
            val_accuracy = (pred == y_test_fold).sum() / len(y_test_fold)
                
            # Report epoch metrics.
            print("Epoch {}/{}\tVal. Loss: {:.4f}\tVal. Accuracy: {:.2f}".format(epoch + 1, num_epochs, loss.item(), val_accuracy))
       
        val_acc_list.append(float(val_accuracy))
        print("Final Validation Accuracy: {}".format(val_accuracy))
        
        
  
    
    # Report the final metrics.
    print("\nValidation complete.")
    print("Validation Accuracies:", val_acc_list)
    print("Average Validation Accuracy: {:.2f}".format(sum(val_acc_list) / len(val_acc_list)))

    # # Plot the training accuracy.
    # fig = plt.figure()
    # ax = plt.axes()
    # x = np.arange(1, num_epochs + 1, 1)
    # plt.title('Validation Accuracy Per Epoch')
    # ax.set_xlabel('Epoch')
    # ax.set_ylabel('Loss')
    # ax.plot(x, val_acc_list)
    # plt.show()
    # return

def evaluate(model, X_test, y_test, tags):

    params_file = 'params.json'
    with open(params_file) as f:
        params = json.load(f)
    
    num_predictions = params['num_predictions']

    # Set the device to a GPU if available.
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

    # Set up as evaluation.
    model.eval()

    index = 0
    correct = 0
    all_preds = []

    for pattern in X_test:

        pattern = pattern.reshape(1, pattern.shape[0])
        pattern = torch.from_numpy(pattern).to(device)
        output = model(pattern)

        _, top_predictions = torch.topk(output, num_predictions, dim=1)
        top_predictions = top_predictions.numpy()[0]

        # Determine the prediction probabilities.
        probs = torch.softmax(output, dim=1)
        probs = probs.detach().numpy()[0]

        # Get the top tags.
        for i in range(top_predictions.size):
            top_tag = tags[top_predictions[i]]

        all_preds.append(top_predictions[0])
            

        if top_predictions[0] == y_test[index]:
            correct += 1

        index += 1

    accuracy = (correct / len(y_test))
    conf_mat = confusion_matrix(y_test, all_preds)
    f1 = f1_score(y_test, all_preds, average='weighted')




    print("Correct:", correct)
    print("Total:", len(y_test))
    print("Accuracy:", accuracy)
    print("Confusion Matrix:", confusion_matrix(y_test, all_preds))

    return accuracy, conf_mat, f1