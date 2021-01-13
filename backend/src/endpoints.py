from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
import database_manager as db

app = Flask(__name__)
CORS(app)
app.config['JSON_SORT_KEYS'] = False


@app.route("/login", methods=["GET", "POST"])
def login():
    req = request.get_json()
    username = req['username']
    password = req['password']
    print(username)
    print(password)
    return jsonify(success=True, message="logged in")



@app.route("/get-intents", methods=["GET"])
def get_intents():
    return db.get_intents()

@app.route("/add-intent", methods=["PUT"])
def add_intent():
    return jsonify(success=False, message="working on it")

@app.route("/update-intent", methods=["POST"])
def update_intent():
    return jsonify(success=False, message="working on it")