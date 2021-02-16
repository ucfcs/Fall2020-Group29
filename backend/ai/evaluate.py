import torch

def evaluate(model, X_test, y_test, tags):

    # Set the device to a GPU if available.
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

    # Set up as evaluation.
    model.eval()

    index = 0
    correct = 0

    for pattern in X_test:

        pattern = pattern.reshape(1, pattern.shape[0])
        pattern = torch.from_numpy(pattern).to(device)
        output = model(pattern)
        _, top_predictions = torch.topk(output, 2, dim=1)
        top_predictions = top_predictions.numpy()[0]

        # Determine the prediction probabilities.
        probs = torch.softmax(output, dim=1)
        probs = probs.detach().numpy()[0]

        # Get the top tags.
        for i in range(top_predictions.size):
            top_tag = tags[top_predictions[i]]
            

        if top_predictions[0] == y_test[index]:
            correct += 1

        index += 1

    print("Correct:", correct)
    print("Total:", len(y_test))
    print("Accuracy:", (correct / len(y_test)))