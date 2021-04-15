from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, create_access_token
from flask_pymongo import PyMongo
from ldap3 import Connection, Server
from ldap3.utils.dn import escape_rdn
from ldap3.core.exceptions import LDAPSocketOpenError, LDAPBindError
from .database_manager import return_all, update_question, add_question, delete_question, add_tag, update_tag, delete_tag, check_valid_user, needs_update_check, set_needs_update
from .train import train
import json

######################################################## Server Initialization ########################################

app = Flask(__name__)
with app.open_resource("config.json") as f:
    config = json.load(f)
for key in config:
    app.config[key] = config[key]

	
CORS(app)
jwt = JWTManager(app)
#The "dnspython" module must be installed to use mongodb+srv:
mongo = PyMongo(app)

######################################################### Login #######################################################

#Faculty_System_API
@app.route("/api/faculty/login", methods=["GET", "POST"])
def login():
    req = request.get_json()
    username = req["username"]
    password = req["password"]
    if username == "" or password == "":
        return jsonify(message="Invalid credentials"), 401
    username = escape_rdn(username)
    
    # Attempts connection to net.ucf.edu on port 389, because we were told to use port 389
    domain = "net.ucf.edu"
    port = 389
    basedn = "dc=net,dc=ucf,dc=edu"
    try:
        server = Server(domain, port=port)
        conn = Connection(server, username + "@" + domain, password)
        
        if conn.bind() and check_valid_user(mongo, username):
            access_token = create_access_token(identity=username)
            conn.unbind()
            return jsonify(message="Login Successful", token=access_token)
        else:
            return jsonify(message="Invalid credentials"), 401

    except LDAPSocketOpenError:
        return jsonify(message="Users must login from within the UCF network"), 401
    except LDAPBindError:
        return jsonify(message="Invalid credentials"), 401

######################################################## Get Data #####################################################

@app.route("/api/faculty/get_questions", methods=["GET"])
def get_questions():

    questions = return_all(mongo, "questions")
    return jsonify(questions=questions)

@app.route("/api/faculty/get_tags", methods=["GET"])
def get_tags():

    tags = return_all(mongo, "tags")
    intent = []
    department = []
    category = []
    information = []

    for t in tags:
        if t["type"].lower() == "intents":
            intent.append({
                "_id": t["_id"],
                "name": t["name"]
            })
        elif t["type"].lower() == "dept":
            department.append({
                "_id": t["_id"],
                "name": t["name"]
            })
        elif t["type"].lower() == "cat":
            category.append({
                "_id": t["_id"],
                "name": t["name"]
            })
        elif t["type"].lower() == "info":
            information.append({
                "_id": t["_id"],
                "name": t["name"]
            })
    return jsonify(tags={
        "intent": intent,
        "department": department,
        "category": category,
        "information": information
    })

@app.route("/api/faculty/get_contacts", methods=["GET"])
def get_contacts():
    cons = return_all(mongo, "contacts")
    contacts = []
    for c in cons:
        contacts.append({
            "_id": c["_id"],
            "name": c["Name"],
            "title": c["Title"],
            "email": c["Email"],
            "phone": c["Phone"],
            "office": c["Office"]
        })
    
    return jsonify(contacts=contacts)

@app.route("/api/faculty/get_documents", methods=["GET"])
def get_documents():
    files = return_all(mongo, "files")
    documents = []
    for f in files:
        documents.append({
            "_id": f["_id"],
            "name": f["name"],
            "department": f["dept"],
            "link": f["link to file"]
        })
    return jsonify(documents=documents)

@app.route("/api/faculty/get_users", methods=["GET"])
def get_users():

    users = return_all(mongo, "users")
    return jsonify(users=users)

######################################################## Add/Update Data ##############################################

@app.route("/api/faculty/add_question", methods=["POST"])
#@jwt_required()
def add_q():
    req = request.get_json()
    question = req["question"]
    tags = question["tags"]
    question["tags"] = [tags["intent"], tags["department"], tags["category"], tags["information"]]
    question.pop("_id")
    added, ex_name = add_question(mongo, question)
    if added == None:
        return jsonify(message=("Question already exists with the requested tags\n \"{0}\"".format(ex_name))), 409
    else:
        return jsonify(message="Question successfully added.", question=added)

@app.route("/api/faculty/update_question", methods=["PUT"])
#@jwt_required()
def update_q():
    req = request.get_json()
    question = req["question"]
    qId = question["_id"]
    tags = question["tags"]
    question["tags"] = [tags["intent"], tags["department"], tags["category"], tags["information"]]
    question.pop("_id")
    updated, ex_name = update_question(mongo, qId, question)
    if updated == None:
        if ex_name == "":
            return jsonify(message="Question not found."), 404
        else:
            return jsonify(message=("Question already exists with the requested tags\n \"{0}\"".format(ex_name))), 409
    else:
        return jsonify(message="Question successfully updated.", question=updated)

@app.route("/api/faculty/retrain_model", methods=["GET"])
#@jwt_required()
def retrain_model():
    train(db=mongo)
    return jsonify(message="Model successfully retrained")

@app.route("/api/faculty/add_tag", methods=["POST"])
#@jwt_required()
def add_t():
    req = request.get_json()
    tag = req["tag"]
    tag_type = tag["type"]
    if (tag_type == "intent"):
        tag["type"] = "intents"
    elif (tag_type == "department"):
        tag["type"] = "dept"
    elif (tag_type == "category"):
        tag["type"] = "cat"
    elif (tag_type == "information"):
        tag["type"] = "info"
    new_tag = add_tag(mongo, tag["name"], tag["type"])
    if (new_tag != None):
        new_tag["type"] = tag_type
        return jsonify(tag=new_tag)
    else:
        return jsonify(message="Tag already exists in database."), 500

@app.route("/api/faculty/update_tag", methods=["PUT"])
#@jwt_required()
def update_t():
    req = request.get_json()
    old_tag = req["old_tag"]
    new_tag = req["new_tag"]
    new_tag.pop("_id")

    tag_type = new_tag["type"]
    if (tag_type == "intent"):
        new_tag["type"] = "intents"
    elif (tag_type == "department"):
        new_tag["type"] = "dept"
    elif (tag_type == "category"):
        new_tag["type"] = "cat"
    elif (tag_type == "information"):
        new_tag["type"] = "info"

    updated = update_tag(mongo, old_tag, new_tag)

    
    if updated == None:
        return jsonify(message="Tag not found."), 404
    else:
        updated_type = updated["type"]
        if (updated_type == "intents"):
            updated["type"] = "intent"
        elif (updated_type == "dept"):
            updated["type"] = "department"
        elif (updated_type == "cat"):
            updated["type"] = "category"
        elif (updated_type == "info"):
            updated["type"] = "information"
        return jsonify(tag=updated)


####################################################### Delete Data ###################################################

@app.route("/api/faculty/delete_question", methods=["DELETE"])
#@jwt_required()
def delete_q():
    req = request.get_json()
    question = req["question"]
    qID = question["_id"]
    deleted, message = delete_question(mongo, qID)
    if (deleted):
        return jsonify(message=message)
    else:
        return jsonify(message=message), 500

@app.route("/api/faculty/delete_tag", methods=["DELETE"])
#@jwt_required()
def delete_t():
    req = request.get_json()
    tag = req["tag"]
    deleted, message = delete_tag(mongo, tag["_id"], tag["name"], tag["type"])
    if (deleted):
        return jsonify(message=message)
    else:
        return jsonify(message=message), 500


####################################################### Settings Access ###############################################

@app.route("/api/faculty/check_needs_training", methods=["GET"])
#@jwt_required()
def check_needs_training():
    trained = needs_update_check(mongo)
    if (trained != None):
        return jsonify(success=True,trained=trained)
    else:
        return jsonify(success=False, message="Could not access training settings"), 500

@app.route("/api/faculty/update_needs_training", methods=["PUT"])
#@jwt_required()
def update_needs_training():
    req = request.get_json()
    value = req["value"]
    if (set_needs_update(mongo, value)):
        return jsonify(success=True)
    else:
        return jsonify(success=False, message="Could not update 'needs training' setting."), 500


####################################################### Dummy Data ####################################################


# Routes for retrieving Dummy Data for testing purposes
@app.route("/api/faculty/get_dummy_questions", methods=["GET"])
def get_dummy_questions():
    return jsonify(questions=[
            {
            "_id":1,
            "name":"Question 1",
            "response":"Response 1",
            "patterns":["Pattern number 1", "Pattern number 2"],
            "tags":{
                "intent": "Advising",
                "department": "Sign-up",
                "category": "BS-MS",
                "information": "How"
                },
            "follow-up":2
            },
            {
            "_id":2,
            "name":"Question 2", 
            "response":"Response 2", 
            "patterns":["Pattern number 3", "Pattern number 4"],
            "tags":{
                "intent": "CECS",
                "department": "Advisor",
                "category": "Foundation Exam",
                "information": "Who"
                }
            }
        ])


@app.route("/api/faculty/get_dummy_tags", methods=["GET"])
def get_dummy_tags():
    return jsonify(tags={
        "intent":[
            {
            "_id": 1,
            "name": "Advising"
            },
            {
            "_id": 2,
            "name": "CECS"
            },
            {
            "_id": 3,
            "name": "CECS-IT"
            }
        ],
        "category":[
            {
            "_id": 1,
            "name": "BS-MS"
            },
            {
            "_id": 2,
            "name": "Foundation Exam"
            }
        ], 
        "department":[
            {
            "_id": 1,
            "name": "Sign-up"
            },
            {
            "_id": 2,
            "name": "Advisor"
            } 
        ],
        "information":[
            {
            "_id": 1,
            "name": "How"
            },
            {
            "_id": 2,
            "name": "Who"
            },
            {
            "_id": 3,
            "name": "When"
            }
        ]
        
    })


@app.route("/api/faculty/get_dummy_contacts", methods=["GET"])
def get_dummy_contacts():
    return jsonify(contacts=[
        {
        "_id": 1,
        "name":"Contact 1",
        "email":"con1@contact.com"
        },
        {
        "_id": 2,
        "name":"Contact 2",
        "email":"con2@contact.com"
        }
    ])


@app.route("/api/faculty/get_dummy_documents", methods=["GET"])
def get_dummy_documents():
    return jsonify(documents=[
        {
        "_id": 1,
        "name": "Document 1"
        },
        {
        "_id": 2,
        "name": "Document 2"
        }
    ])

if __name__ == "__main__":
	app.run()
