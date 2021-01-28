from flask import Flask, jsonify, request

app = Flask(__name__)

new_response = "Hello"

# Home page
@app.route("/")
def home():
    return "Home Page"


# POST to recieve an input
@app.route("/api/user-response", methods=["POST"])
def create_response():
    pass


# GET to send a response
# /chatbot-response
@app.route("/api/knugget-response", methods=["GET"])
def get_response():
    return jsonify(new_response)


app.run(port=5000)
