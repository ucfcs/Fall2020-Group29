from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, create_access_token
from flask_pymongo import PyMongo
from ldap3 import Connection, Server
from ldap3.utils.dn import escape_rdn
from ldap3.core.exceptions import LDAPSocketOpenError, LDAPBindError
from .database_manager import return_all, update_question

app = Flask(__name__)
app.config["JSON_SORT_KEYS"] = False
app.config["JWT_SECRET_KEY"] = "Test_Secret_Key" #Change for actual production
app.config["MONGO_DBNAME"] =  "group29" #"ourDB" <-- local connection
app.config["MONGO_URI"] =  "mongodb+srv://m_user:spell3@clusterg29.pfoak.mongodb.net/group29?retryWrites=true&w=majority" #"mongodb://localhost:27017/ourDB" <-- local connection


CORS(app)
jwt = JWTManager(app)
#The "dnspython" module must be installed to use mongodb+srv:
mongo = PyMongo(app)



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
        
        if conn.bind():

            access_token = create_access_token(identity=username)
            conn.unbind()
            return jsonify(message="Login Successful", token=access_token)
        else:
            return jsonify(message="Invalid credentials"), 401

    except LDAPSocketOpenError:
        return jsonify(message="Users must login from within the UCF network"), 401
    except LDAPBindError:
        return jsonify(message="Invalid credentials"), 401

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
            "name": f["File Name"],
            "department": f["Department"],
            "link": f["Link to File"]
        })
    return jsonify(documents=documents)

@app.route("/api/faculty/add_question", methods=["POST"])
def add_question():
    return jsonify(question={})

@app.route("/api/faculty/update_question", methods=["PUT"])
def update_q():
    req = request.get_json()
    question = req["question"]
    qId = question["_id"]
    tags = question["tags"]
    question["tags"] = [tags["intent"], tags["department"], tags["category"], tags["information"]]
    question.pop("_id")
    question.pop("number")
    updated = update_question(mongo, qId, question)
    if updated == None:
        return jsonify(message="Question not found."), 404
    else:
        return jsonify(question=updated)



####################################################### Dummy Data ####################################################


# Routes for retrieving Dummy Data for testing purposes
@app.route("/api/faculty/get_dummy_questions", methods=["GET"])
def get_dummy_questions():
    return jsonify(questions=[
            {
            "_id":1,
            "number":1,
            "name":"Question 1",
            "responses":["Response 1"],
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
            "number":2,
            "name":"Question 2", 
            "responses":["Response 2", "Response 3"], 
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
