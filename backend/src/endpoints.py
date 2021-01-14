from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
import database_manager as db
from flask_jwt_extended import JWTManager, jwt_required, create_access_token

app = Flask(__name__)
app.config['JSON_SORT_KEYS'] = False
app.config['JWT_SECRET_KEY'] = "Test_Secret_Key" #Change for actual production

CORS(app)
jwt = JWTManager(app)

@app.route("/login", methods=["GET", "POST"])
def login():
    req = request.get_json()
    username = req['username']
    password = req['password']
    if username == "" or password == "":
        return jsonify(message="Invalid credentials"), 401
    print(username)
    print(password)
    
    authenticated = True # Actual LDAP Authentication Goes Here

    if authenticated:
        access_token = create_access_token(identity=username)
        return jsonify(message="Login Successful", token=access_token)
    else:
        return jsonify(message="Invalid credentials"), 401



@app.route("/get-intents", methods=["GET"])
def get_intents():
    return db.get_intents()

@app.route("/add-intent", methods=["PUT"])
def add_intent():
    return jsonify(success=False, message="working on it")

@app.route("/update-intent", methods=["POST"])
def update_intent():
    return jsonify(success=False, message="working on it")