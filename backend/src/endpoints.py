from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, create_access_token
from ldap3 import Connection, Server, SAFE_SYNC
from ldap3.utils.dn import escape_rdn
from ldap3.core.exceptions import LDAPSocketOpenError, LDAPBindError

app = Flask(__name__)
app.config['JSON_SORT_KEYS'] = False
app.config['JWT_SECRET_KEY'] = "Test_Secret_Key" #Change for actual production

CORS(app)
jwt = JWTManager(app)



#Faculty_System_API
@app.route("/api/faculty/login", methods=["GET", "POST"])
def login():
    req = request.get_json()
    username = req['username']
    password = req['password']
    if username == "" or password == "":
        return jsonify(message="Invalid credentials"), 401
    username = escape_rdn(username)
    domain = 'net.ucf.edu'
    port = 389
    basedn = 'dc=net,dc=ucf,dc=edu'
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
    return jsonify(questions=[
            {
            "id":0,
            "name":"Question 1",
            "responses":["Response 1"],
            "patterns":["Pattern number 1", "Pattern number 2"],
            "tags":{
                "intent": "Advising",
                "department": "Sign-up",
                "category": "BS-MS",
                "information": "How"
                }
            },
            {
            "id":1,
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


@app.route("/api/faculty/get_tags", methods=["GET"])
def get_entities():
    return jsonify(tags={"intents":["Advising", "CECS", "CECS-IT"],"entities":{"category":["BS-MS", "Foundation Exam"], "department":["Sign-up", "Advisor"], "info":["How", "Who", "When"]}})
        