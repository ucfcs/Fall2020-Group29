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
from bson.objectid import ObjectId # so that we can actually make objects of type ObjectID

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
@app.route('/add_question', methods=['POST']) # add a question to the database with Name, Responses, and Tags, returns this new document. pls check if it exists first.
def add_question( name = 'testo',  patterns = ['swoop', 'yoop doop', 'hopla?'], tags = ['beep boop', 'noop', 'yoop', 'ploop'], response = 'this is an test'):
  new_question = {'name': name, 'patterns': patterns, 'tags':[x.lower() for x in tags], 'response': response} # we make sure all tags are lower case
  
  InsertOneResult_Obj = mongo.db.questions.insert_one(new_question) # insert_one() doesn't return a document, it returns a result that contains the ObjectID
  
  new_question.update({'_id':str(InsertOneResult_Obj.inserted_id)}) # append new_question with the ObjectID (as a string) so that we can actually return something that resembles a document :/
 
  return jsonify(new_question)

# retrive
@app.route('/get_question', methods=['GET']) # retrive a question based on Tags
def get_question( tags = ['Advising', 'Cecs-Csit', 'Major-CS', 'Credit-Hours'] ):
  found = mongo.db.questions.find_one({'tags': { '$all': [x.lower() for x in tags] }}) #finds the entry with the exact set of Tags

  if (found is None): # if there is no match
    return jsonify({'result':'no match'})

  fickleID = found.pop('_id') # jasonify() doens't know how to handle objects of type ObjectID, so we remove it
  found.update({'_id': str(fickleID)}) # put _id back in but as a regular string now

  return jsonify(found) #return result as json

# TODO: search questions/responses for a word

# update
@app.route('/update_question', methods=['PUT']) # give an existing question a file, returns updated document
def update_question(tags = ['beep boop', 'noop', 'yoop', 'ploop'], itemToUpdate = 'name', newContents = 'testo updateo' ):
  updated = mongo.db.questions.find_one_and_update(
    {
      'tags': { '$all': [x.lower() for x in tags] } 
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
def put_file( tags = ['beep boop', 'noop', 'yoop', 'ploop'], file = 'https://www.cs.ucf.edu/wp-content/uploads/2020/04/CSIT-Elective-List-AY2020-2021.pdf' ):
  updated = mongo.db.questions.find_one_and_update(
    {
      'tags': { '$all': [x.lower() for x in tags] } 
    }, 
    {
      '$set': { 'file':file } 
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
def put_contact(tags = ['beep boop', 'noop', 'yoop', 'ploop'], contact = 'heinrich@cs.ucf.edu' ):
  updated = mongo.db.questions.find_one_and_update(
    {
      'tags': { '$all': [x.lower() for x in tags] } 
    }, 
    {
      '$set': { 'contact':contact } 
    },
    upsert=True, # upsert = if thing does not exist, make it exist
    return_document=ReturnDocument.AFTER # need this or else it returns the document from before the update
    )
  if (updated is None): #if there is no match
    return jsonify({'result':'no match'})

  fickleID = updated.pop('_id') # jasonify() doens't know how to handle objects of type ObjectID, so we remove it
  updated.update({'_id': str(fickleID)}) # put _id back in but as a regular string now

  return jsonify(updated)

# add a field follow up question 
@app.route('/put_related_questions', methods=['PUT']) # delete a pattern from a question found based on tags
def put_related_questions(tags = ['beep boop', 'noop', 'yoop', 'ploop'], followUp_ID = ['6065f38bac9dc35cb433ea88']):
  found = mongo.db.questions.find_one_and_update( 
    {
      'tags': { '$all': [x.lower() for x in tags] } 
    }, 
    {
      '$set': { 'related questions': followUp_ID }
    },
    return_document=ReturnDocument.AFTER
    )
  if (found is None): # if there is no match
    return jsonify({'result':'no match'})

  fickleID = found.pop('_id') # jasonify() doens't know how to handle objects of type ObjectID, so we remove it
  found.update({'_id': str(fickleID)}) # put _id back in but as a regular string now
  

  return jsonify(found) #return result as json

# delete one field
@app.route('/remove_one_field', methods=['PUT']) # delete a field from a question found based on tags
def remove_one_field(tags = ['beep boop', 'noop', 'yoop', 'ploop'], field = 'related questions'): 
  found = mongo.db.questions.find_one_and_update( 
    {
      '$and': [
        {'tags': { '$all': [x.lower() for x in tags] }},
        {field: {'$exists': True} }
      ]
    }, 
    {
      '$unset': { field:"" }
    },
    return_document=ReturnDocument.AFTER
    )
  if (found is None): # if there is no match
    return jsonify({'result':'no match'})

  fickleID = found.pop('_id') # jasonify() doens't know how to handle objects of type ObjectID, so we remove it
  found.update({'_id': str(fickleID)}) # put _id back in but as a regular string now

  return jsonify(found) #return result as json

# search via ObjectID
@app.route('/get_question_via_ID', methods=['GET']) # retrive a question based on id
def get_question_via_ID( _id = "6065f38bac9dc35cb433ea88" ):
  found = mongo.db.questions.find_one({'_id': ObjectId(_id) }) #finds the entry with the exact set of tags 

  if (found is None): # if there is no match
    return jsonify({'result':'no match'})

  fickleID = found.pop('_id') # jasonify() doens't know how to handle objects of type ObjectID, so we remove it
  found.update({'_id': str(fickleID)}) # put _id back in but as a regular string now
  
  return jsonify(found) #return result as json

#delete
@app.route('/delete_question', methods=['DELETE']) # delete a question based on tags
def delete_question(tags = ['beep boop', 'noop', 'yoop', 'ploop']):
  found = mongo.db.questions.find_one({'tags':{ '$all': [x.lower() for x in tags] }}) #finds the entry with the exact set of tags 

  if (found is None): # if there is no match
    return jsonify({'result':'no match'})
  
  mongo.db.questions.remove( {'tags':{ '$all': [x.lower() for x in tags] }} )
  return jsonify({'result':'deleted'}) #return result as json

# delete one pattern
@app.route('/remove_one_pattern', methods=['PUT']) # delete a pattern from a question found based on tags
def remove_one_pattern(tags = ['beep boop', 'noop', 'yoop', 'ploop'], pattern = 'yoop doop'):
  found = mongo.db.questions.find_one_and_update( 
    {
      '$and': [
        {'tags': { '$all': [x.lower() for x in tags] }},
        {'patterns': pattern }
      ]
    }, 
    {
      '$pull': { 'patterns': pattern }
    },
    return_document=ReturnDocument.AFTER
    )
  if (found is None): # if there is no match
    return jsonify({'result':'no match'})

  fickleID = found.pop('_id') # jasonify() doens't know how to handle objects of type ObjectID, so we remove it
  found.update({'_id': str(fickleID)}) # put _id back in but as a regular string now

  return jsonify(found) #return result as json

# add one pattern
@app.route('/add_one_pattern', methods=['PUT']) # delete a pattern from a question found based on tags
def add_one_pattern(tags = ['beep boop', 'noop', 'yoop', 'ploop'], pattern = 'yoop doop'):
  found = mongo.db.questions.find_one_and_update( 
    {
      'tags': { '$all': [x.lower() for x in tags] },
    }, 
    {
      '$addToSet': { 'patterns': pattern }
    },
    return_document=ReturnDocument.AFTER
    )
  if (found is None): # if there is no match
    return jsonify({'result':'no match'})

  fickleID = found.pop('_id') # jasonify() doens't know how to handle objects of type ObjectID, so we remove it
  found.update({'_id': str(fickleID)}) # put _id back in but as a regular string now

  return jsonify(found) #return result as json


### contacts collection ###
#contacts should have dept and maybe grad/undergrad
# add
@app.route('/add_contact', methods=['POST']) # add a contact to the database with Name, Title, Email, Phone and Office, returns inerted doctment 
def add_contact(name = 'Mark Heinrich', title = 'CS Advisor', email = 'heinrich@cs.ucf.edu', phone = '(407) 882-0138', office = 'HEC 345', dept = 'CS', level = 'undergraduate'):
  new_contact = {'name':name, 'title':title, 'email':email, 'phone':phone, 'office':office, 'dept':dept, 'level':level }
  InsertOneResult_Obj = mongo.db.contacts.insert_one(new_contact) # insert_one() doesn't return a document, it returns a result that contains the ObjectID
  new_contact.update({'_id':str(InsertOneResult_Obj.inserted_id)}) # append new_contact with the ObjectID (as a string) so that we can actually return something that resembles a document :/
 
  return jsonify(new_contact)

# TODO: search

# update
@app.route('/update_contact', methods=['PUT']) # give an existing contact a file, returns updated document
def update_contact(name = 'Mark Heinrich', title = 'CS Advisor', itemToUpdate = 'name', newContents = 'Mark Heinrich 2' ):
  updated = mongo.db.contacts.find_one_and_update(
    {
      '$and': [
        {'name':name},
        {'title':title}
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

# TODO: add a link
# TODO: delete


## tags collection ##

# TODO: create - tag name & tag type

# TODO: search tags

# TODO: search a triplet of entities

# TODO: update
# TODO: update all questions in the database with this tag

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


## settings collection ##

# checks if there needs training
@app.route('/needs_update_check', methods=['GET']) 
def needs_update_check():
  found = mongo.db.settings.find_one({'needs training':True}) 

  if (found is None): # if there is no match
    return jsonify({'needs training':False})

  return jsonify({'needs training':True}) #return result as json

# changes the status of needs training
@app.route('/set_needs_update', methods=['PUT'])
def set_needs_update(set = True):
  updated = mongo.db.settings.find_one_and_update(
    {}, 
    {
      '$set': { 'needs training':set }
    },
    upsert=False, # upsert = if thing does not exist, make it exist
    return_document=ReturnDocument.AFTER # need this or else it returns the document from before the update
    )
  if (updated is None): #if there is no match
    return jsonify({'result':'no match'})

  fickleID = updated.pop('_id') # jasonify() doens't know how to handle objects of type ObjectID, so we remove it
  updated.update({'_id':str(fickleID)}) # put _id back in but as a regular string now

  return jsonify(updated)



if __name__ == '__main__':
    app.run(debug=True) #run in debug mode so that when the .py updates, the whole thing relaunches too
