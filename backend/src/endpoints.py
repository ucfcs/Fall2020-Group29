from flask import Flask, jsonify, request, make_response
import database_manager as db

app = Flask(__name__)
app.config['JSON_SORT_KEYS'] = False


@app.route("/get-intents", methods=["GET"])
def get_intents():
    return db.get_intents()

@app.route("/add-intent", methods=["PUT"])
def add_intent():
    return jsonify(success=False, message="working on it")

@app.route("/update-intent", methods=["POST"])
def update_intent():
    return jsonify(success=False, message="working on it")