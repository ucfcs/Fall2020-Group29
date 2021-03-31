from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_pymongo import PyMongo
from pymongo import MongoClient
from pymongo import ReturnDocument
import traceback
from .apitest import get_question


# from ...ai import chatbot
from .chatbot import predict

app = Flask(__name__)
CORS(app)

# connecting to the database
app.config["MONGO_DBNAME"] = "group29"  #'ourDB' <-- local connection
app.config[
    "MONGO_URI"
] = "mongodb+srv://m_user:spell3@clusterg29.pfoak.mongodb.net/group29?retryWrites=true&w=majority"  #'mongodb://localhost:27017/ourDB' <-- local connection
# The "dnspython" module must be installed to use mongodb+srv:
mongo = PyMongo(app)
new_response = "Hello"

# Home page
@app.route("/")
def home():
    return "Home Page"


# POST to recieve an input
@app.route("/api/user-response", methods=["POST", "GET"])
def create_response():
    try:
        # Saves the json in the user_response variable.
        user_response = request.get_json()
        user = user_response["name"]

        # predict the department, category, info
        result = predict(user)
        dept = result["dept"][0]["tag"]
        category = result["cat"][0]["tag"]
        info = result["info"][0]["tag"]
        intent = result["ints"][0]["tag"]

        Entities = [intent, dept, category, info]
        # res = get_question(Entities)

        found = mongo.db.questions.find_one({"tags": {"$all": Entities}})
        if found is None:  # if there is no match
            return jsonify({"result": "no match"})
        fickleID = found.pop(
            "_id"
        )  # jasonify() doens't know how to handle objects of type ObjectID, so we remove it
        found.update(
            {"_id": str(fickleID)}
        )  # put _id back in but as a regular string now
        response = found["responses"][0]
        # response = res["responses"][0]

        return jsonify(
            {
                "department": dept,
                "category": category,
                "information": info,
                "answer": response,
                # "intent": intent,
            }
        )
    except:
        print(traceback.print_exc())


# GET to send a response
# /chatbot-response
@app.route("/api/knugget-response", methods=["GET"])
def get_response():
    return jsonify({"name": new_response})


if __name__ == "__main__":
    app.run(port=5000)
