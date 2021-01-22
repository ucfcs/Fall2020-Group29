from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, create_access_token
from ldap3 import Connection, Server
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
    
    # Attempts connection to net.ucf.edu on port 389, because we were told to use port 389
    domain = 'net.ucf.edu'
    port = 389
    basedn = 'dc=net,dc=ucf,dc=edu'
    try:
        server = Server(domain, port=port)
        conn = Connection(server, username + "@" + domain, password)
        
        if conn.bind():
            # Add with check for UCF Faculty
            access_token = create_access_token(identity=username)
            conn.unbind()
            return jsonify(message="Login Successful", token=access_token)
        else:
            return jsonify(message="Invalid credentials"), 401

    except LDAPSocketOpenError:
        return jsonify(message="Users must login from within the UCF network"), 401
    except LDAPBindError:
        return jsonify(message="Invalid credentials"), 401
        