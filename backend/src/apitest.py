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
from pymongo import ReturnDocument # so that we can return the updated version of the document after updating it

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


@app.route('/get_question', methods=['GET']) # retrive a question based on entities
def get_question(entities = ['BS-to-MS', 'How', 'Sign Up']):
  found = mongo.db.questions.find_one({'entities': { '$all': entities }}) #finds the entry with the exact set of entities 

  fickleID = found.pop('_id') # jasonify() doens't know how to handle objects of type ObjectID, so we remove it
  found.update({'_id': str(fickleID)}) # put _id back in but as a regular string now
  
  return jsonify(found) #return result as json


@app.route('/add_question', methods=['POST']) # add a question to the database with name, response, an entites
def add_question(name = "BS-to-MS", response = "In order to dah da da da da", entities = ['BS-to-MS', 'How', 'Sign Up'] ):
  questions = mongo.db.questions
  questions_id = questions.insert({'name': name, 'responses': response, 'entities':entities})
  new_question = questions.find_one({'_id': questions_id })
  output = {'name' : new_question['name'], 'responses' : new_question['responses'], 'entities':new_question['entities']}
  return jsonify(output)


@app.route('/add_file', methods=['PUT']) # give an existing question a file, returns updated document
def add_file(entities = ['BS-to-MS', 'How', 'Sign Up'], file = 'https://www.cs.ucf.edu/wp-content/uploads/2020/04/CSIT-Elective-List-AY2020-2021.pdf' ):
  updated = mongo.db.questions.find_one_and_update(
    {
      'entities': { '$all': entities }
    }, 
    {
      '$set': { 'file':file } 
    },
    upsert=True, # upsert = if thing does not exist, make it exist
    return_document=ReturnDocument.AFTER # need this or else it returns the document from before the update
    )

  fickleID = updated.pop('_id') # jasonify() doens't know how to handle objects of type ObjectID, so we remove it
  updated.update({'_id': str(fickleID)}) # put _id back in but as a regular string now

  return jsonify(updated)


@app.route('/add_contact', methods=['PUT']) # give an existing question a contact, returns updated document
def add_file(entities = ['BS-to-MS', 'How', 'Sign Up'], contact = 'heinrich@cs.ucf.edu' ):
  updated = mongo.db.questions.find_one_and_update(
    {
      'entities': { '$all': entities }
    }, 
    {
      '$set': { 'comtact':contact } 
    },
    upsert=True, # upsert = if thing does not exist, make it exist
    return_document=ReturnDocument.AFTER # need this or else it returns the document from before the update
    )

  fickleID = updated.pop('_id') # jasonify() doens't know how to handle objects of type ObjectID, so we remove it
  updated.update({'_id': str(fickleID)}) # put _id back in but as a regular string now

  return jsonify(updated)






if __name__ == '__main__':
    app.run(debug=True) #run in debug mode so that when the .py updates, the whole thing relaunches too
