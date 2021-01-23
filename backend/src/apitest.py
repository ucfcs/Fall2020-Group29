#################
# > venv\Scripts\activate
# (venv) > python apitest.py
# Postman http://localhost:5000/questions
#################
#api key store in safe place: beb3e463-d2f0-4e64-874c-c6a39f9e8b76
#
#
#################

from flask import Flask
from flask import jsonify
from flask import request
from flask_pymongo import PyMongo
from pymongo import MongoClient
import json

app = Flask(__name__)

app.config['MONGO_DBNAME'] =  'group29' #'ourDB' <-- local connection
app.config['MONGO_URI'] =  'mongodb+srv://m_user:spell3@clusterg29.pfoak.mongodb.net/group29?retryWrites=true&w=majority' #'mongodb://localhost:27017/ourDB' <-- local connection
#The "dnspython" module must be installed to use mongodb+srv:
mongo = PyMongo(app)

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

@app.route("/home")
def index_page():
    return "Home Page"


@app.route('/get_question', methods=['GET'])
def get_question(entities = ['BS-to-MS', 'How', 'Sign Up']):
  found = mongo.db.questions.find_one({'entities': { '$all': entities }}) #finds the entry with the exact set of entities 

  fickleID = found.pop('_id') # jasonify doens't know how to handle objects of type ObjectID, so we remove it
  found.update({'_id': str(fickleID)}) # put _id back in but as a regular string now
  
  return jsonify(found) #return result as json



@app.route('/add_question', methods=['POST'])
def add_question(name = "BS-to-MS", response = "In order to dah da da da da", entities = ['BS-to-MS', 'How', 'Sign Up'] ):
  questions = mongo.db.questions
  questions_id = questions.insert({'name': name, 'responses': response, 'entities':entities})
  new_question = questions.find_one({'_id': questions_id })
  output = {'name' : new_question['name'], 'responses' : new_question['responses'], 'entities':new_question['entities']}
  return jsonify(output)


'''
@app.route('/add_file', methods=['PUT'])
def add_file(entities = ['BS-to-MS', 'How', 'Sign Up'], file = 'https://www.cs.ucf.edu/wp-content/uploads/2020/04/CSIT-Elective-List-AY2020-2021.pdf' ):
  questions = mongo.db.questions
  new_questions = questions.update({'Entities': { '$all': entities }, '$set':{'file':file}})
  output = {'Name' : new_questions['Name'], 'response' : new_questions['response'], 'entities':new_questions['entities'], 'file':file}
  return jsonify({'result' : output})
'''
if __name__ == '__main__':
    app.run(debug=True) #run in debug mode so that when the .py updates, the whole thing relaunches too
