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
    username = escape_rdn(req['username'])
    password = req['password']
    if username == "" or password == "":
        return jsonify(message="Invalid credentials"), 401

    domain = 'net.ucf.edu'
    port = 389
    basedn = 'dc=net,dc=ucf,dc=edu'
    try:
        server = Server(domain, port=port)
        conn = Connection(server, username + "@" + domain, password, strategy=SAFE_SYNC, auto_bind=True)
        conn.search(basedn, '(cn='+username+')')
        response = conn.response[0]
        # Insert check for UCF Faculty
        if 'dn' in response and response['dn'] == username:
            access_token = create_access_token(identity=username)
            return jsonify(message="Login Successful", token=access_token)

    except LDAPSocketOpenError:
        return jsonify(message="Users must login from within the UCF network"), 401
    except LDAPBindError:
        return jsonify(message="Invalid credentials"), 401
        