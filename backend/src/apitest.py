#################C:\Users\Maya\Documents\projects\flask-app\venv\Scripts\activate
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
from bson.objectid import ObjectId

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


## ##
# return all documents in a collection
@app.route('/return_all', methods=['GET']) 
def return_all( Collection = 'questions' ):
  found = mongo.db[Collection].find({})
  
  if (found is None): # if it comes back empty
    return jsonify({'result':'no results'})

  list = []
  for i in found: # itterate over curor 
    fickleID = i.pop('_id') # jasonify() doens't know how to handle objects of type ObjectID, so we remove it
    i.update({'_id': str(fickleID)}) # put _id back in but as a regular string now
    list.append(i)

  return jsonify(list) #return result as json

### questions collection ###
# add 
@app.route('/add_question', methods=['POST']) # add a question to the database with Name, Responses, an Entities, returns this new document
def add_question( Name = "BS-to-MS", Responses = ["In order to dah da da da da"], Entities = ['BS-to-MS', 'How', 'Sign Up'] ):
  new_question = {'Name': Name, 'Responses': Responses, 'Entities':Entities}
  
  InsertOneResult_Obj = mongo.db.questions.insert_one(new_question) # insert_one() doesn't return a document, it returns a result that contains the ObjectID
  
  new_question.update({'_id':str(InsertOneResult_Obj.inserted_id)}) # append new_question with the ObjectID (as a string) so that we can actually return something that resembles a document :/
 
  return jsonify(new_question)

# retrive
@app.route('/get_question', methods=['GET']) # retrive a question based on Entities
def get_question( Entities = ['BS-to-MS', 'How', 'Sign Up'] ):
  found = mongo.db.questions.find_one({'Entities': { '$all': Entities }}) #finds the entry with the exact set of Entities 

  if (found is None): # if there is no match
    return jsonify({'result':'no match'})

  fickleID = found.pop('_id') # jasonify() doens't know how to handle objects of type ObjectID, so we remove it
  found.update({'_id': str(fickleID)}) # put _id back in but as a regular string now
  print("beep boop")
  print(__name__)


  return jsonify(found) #return result as json

# TODO: search questions/responses for a word

# update
@app.route('/update_question', methods=['PUT']) # give an existing question a file, returns updated document
def update_question(Entities = ['BS-to-MS', 'How', 'Sign Up'], itemToUpdate = 'Name', newContents = 'why hello there' ):
  updated = mongo.db.questions.find_one_and_update(
    {
      'Entities': { '$all': Entities }
    }, 
    {
      '$set': { itemToUpdate:newContents } 
    },
    upsert=False, # upsert = if thing does not exist, make it exist
    return_document=ReturnDocument.AFTER # need this or else it returns the document from before the update
    )
  if (updated is None): # if there is no match
    return jsonify({'result':'no match'})
  
  fickleID = updated.pop('_id') # jasonify() doens't know how to handle objects of type ObjectID, so we remove it
  updated.update({'_id': str(fickleID)}) # put _id back in but as a regular string now

  return jsonify(updated)

# append existing question with a file
@app.route('/put_file', methods=['PUT']) # give an existing question a file, returns updated document
def put_file( Entities = ['BS-to-MS', 'How', 'Sign Up'], file = 'https://www.cs.ucf.edu/wp-content/uploads/2020/04/CSIT-Elective-List-AY2020-2021.pdf' ):
  updated = mongo.db.questions.find_one_and_update(
    {
      'Entities': { '$all': Entities }
    }, 
    {
      '$set': { 'File':file } 
    },
    upsert=True, # upsert = if thing does not exist, make it exist
    return_document=ReturnDocument.AFTER # need this or else it returns the document from before the update
    )
  if (updated is None): # if there is no match
    return jsonify({'result':'no match'})
  fickleID = updated.pop('_id') # jasonify() doens't know how to handle objects of type ObjectID, so we remove it
  updated.update({'_id': str(fickleID)}) # put _id back in but as a regular string now

  return jsonify(updated)

# append existing question with a contact
@app.route('/put_contact', methods=['PUT']) # give an existing question a contact, returns updated document
def put_contact(Entities = ['BS-to-MS', 'How', 'Sign Up'], contact = 'heinrich@cs.ucf.edu' ):
  updated = mongo.db.questions.find_one_and_update(
    {
      'Entities': { '$all': Entities }
    }, 
    {
      '$set': { 'Contact':contact } 
    },
    upsert=True, # upsert = if thing does not exist, make it exist
    return_document=ReturnDocument.AFTER # need this or else it returns the document from before the update
    )
  if (updated is None): #if there is no match
    return jsonify({'result':'no match'})

  fickleID = updated.pop('_id') # jasonify() doens't know how to handle objects of type ObjectID, so we remove it
  updated.update({'_id': str(fickleID)}) # put _id back in but as a regular string now

  return jsonify(updated)

  # TODO: append an experation date to a question?
  # TODO: append follow up question 
# search via ObjectID
@app.route('/get_question_via_ID', methods=['GET']) # retrive a question based on id
def get_question_via_ID( _id = "6049969161a11a47b4b8fe4e" ):
  found = mongo.db.questions.find_one({'_id': ObjectId(_id) }) #finds the entry with the exact set of Entities 

  if (found is None): # if there is no match
    return jsonify({'result':'no match'})

  fickleID = found.pop('_id') # jasonify() doens't know how to handle objects of type ObjectID, so we remove it
  found.update({'_id': str(fickleID)}) # put _id back in but as a regular string now
  
  return jsonify(found) #return result as json

#delete
@app.route('/delete_question', methods=['DELETE']) # retrive a question based on Entities
def delete_question(Entities = ['BS-to-MS', 'How', 'Sign Up']):
  found = mongo.db.questions.find_one({'Entities':{ '$all': Entities }}) #finds the entry with the exact set of Entities 

  if (found is None): # if there is no match
    return jsonify({'result':'no match'})

  fickleID = found.pop('_id') # jasonify() doens't know how to handle objects of type ObjectID, so we remove it
  found.update({'_id':str(fickleID)}) # put _id back in but as a regular string now
  
  return jsonify(found) #return result as json


### contacts collection ###
# add
@app.route('/add_contact', methods=['POST']) # add a contact to the database with Name, Title, Email, Phone and Office, returns inerted doctment 
def add_contact(Name = 'Mark Heinrich', Title = 'CS Advisor', Email = 'heinrich@cs.ucf.edu', Phone = '(407) 882-0138', Office = 'HEC 345'):
  new_contact = {'Name':Name, 'Title':Title, 'Email':Email, 'Phone':Phone, 'Office':Office}
  InsertOneResult_Obj = mongo.db.contacts.insert_one(new_contact) # insert_one() doesn't return a document, it returns a result that contains the ObjectID
  new_contact.update({'_id':str(InsertOneResult_Obj.inserted_id)}) # append new_contact with the ObjectID (as a string) so that we can actually return something that resembles a document :/
 
  return jsonify(new_contact)

# TODO: search

# update
@app.route('/update_contact', methods=['PUT']) # give an existing contact a file, returns updated document
def update_contact(Name = 'Mark Heinrich', Title = 'CS Advisor', itemToUpdate = 'Name', newContents = 'Mark Heinrich 2' ):
  updated = mongo.db.contacts.find_one_and_update(
    {
      '$and': [
        {'Name':Name},
        {'Title':Title}
      ]
    }, 
    {
      '$set': { itemToUpdate:newContents } 
    },
    upsert=False, # upsert = if thing does not exist, make it exist
    return_document=ReturnDocument.AFTER # need this or else it returns the document from before the update
    )
  if (updated is None): #if there is no match
    return jsonify({'result':'no match'})

  fickleID = updated.pop('_id') # jasonify() doens't know how to handle objects of type ObjectID, so we remove it
  updated.update({'_id':str(fickleID)}) # put _id back in but as a regular string now

  return jsonify(updated)

# TODO: delete


## entities collection ##

# TODO: create 

# TODO: search entity

# TODO: search a triplet of entities

# TODO: update
# update all questions with this tag

# TODO: delete


## files collection ##

# TODO: create 

# TODO: search files

# TODO: update

# TODO: delete


## users collection ##

# TODO: create 

# TODO: search

# TODO: update

# TODO: delete



if __name__ == '__main__':
    app.run(debug=True) #run in debug mode so that when the .py updates, the whole thing relaunches too
