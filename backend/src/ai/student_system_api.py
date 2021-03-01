from flask import Flask, jsonify, request
from flask_cors import CORS
import traceback

# from ...ai import chatbot
from chatbot import predict

app = Flask(__name__)
CORS(app)
new_response = "Hello"


# Home page
@app.route("/")
def home():
    return "Home Page"


# POST to recieve an input
@app.route("/api/user-response", methods=["POST"])
def create_response():
    try:
        # Saves the json in the user_response variable.
        user_response = request.get_json()
        user = user_response["name"]

        result = predict(user)
        dept = result["dept"][0]["tag"]
        category = result["cat"][0]["tag"]
        return jsonify({"dept": dept, "category": category})
    except:
        print(traceback.print_exc())


# GET to send a response
# /chatbot-response
@app.route("/api/knugget-response", methods=["GET"])
def get_response():
    return jsonify({"name": new_response})


if __name__ == "__main__":
    app.run(port=5000)
