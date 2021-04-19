# this is for testing AIPs, this uses a development server, the actual application does not call these specific 
# instances of the APIs, tested APIs are moved into database_manager.py for use
#################
# activate virtual envornment, run python file:
# > C:\Users\Maya\Documents\projects\flask-app\venv\Scripts\activate           /     > venv\Scripts\activate
# (venv) > python apitest.py
# 
# In Postman:
# http://localhost:5000/api_name
#################

from logging import NOTSET
from flask import Flask
from flask import jsonify
from flask import request
from flask_pymongo import PyMongo
from pymongo import MongoClient
from pymongo import ReturnDocument # so that we can return the updated version of the document after updating it
from bson.objectid import ObjectId # so that we can actually make objects of type ObjectID
from datetime import datetime # so that we can add a date that a statistic was added
date_time_format = '%Y-%m-%d %H:%M:%S' # we format datetime as YYYY-MM-DD HH:MM:SS


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


### questions collection ### delete
# add 
@app.route('/add_question', methods=['POST']) # add a question to the database with Name, Responses, and Tags, returns this new document. pls check if it exists first.
def add_question( name = 'testo',  patterns = ['swoop', 'yoop doop', 'hopla?'], tags = ['beep boop', 'noop', 'yoop', 'ploop'], response = 'this is an test'):
  new_question = {'name': name, 'patterns': patterns, 'tags':[x.lower() for x in tags], 'response': response} # we make sure all tags are lower case
  
  InsertOneResult_Obj = mongo.db.questions.insert_one(new_question) # insert_one() doesn't return a document, it returns a result that contains the ObjectID
  
  new_question.update({'_id':str(InsertOneResult_Obj.inserted_id)}) # append new_question with the ObjectID (as a string) so that we can actually return something that resembles a document :/
 
  return jsonify(new_question)

# search
@app.route('/get_question', methods=['GET']) # retrive a question based on Tags
def get_question( tags = ['Advising', 'Cecs-Csit', 'Major-CS', 'Credit-Hours'] ):
  found = mongo.db.questions.find_one({'tags': { '$all': [x.lower() for x in tags] }}) #finds the entry with the exact set of Tags

  if (found is None): # if there is no match
    return jsonify({'result':'no match'})

  fickleID = found.pop('_id') # jasonify() doens't know how to handle objects of type ObjectID, so we remove it
  found.update({'_id': str(fickleID)}) # put _id back in but as a regular string now

  return jsonify(found) #return result as json

# update
@app.route('/update_question', methods=['PUT']) # give an existing question a file, returns updated document
def update_question(question_ID = '6065f38bac9dc35cb433ea88', update = {'name' :'testo updateo'}):#tags = ['beep boop', 'noop', 'yoop', 'ploop'], itemToUpdate = 'name', newContents = 'testo updateo' ):
  updated = mongo.db.questions.find_one_and_update(
    {
      '_id':ObjectId(question_ID)#'tags': { '$all': [x.lower() for x in tags] } 
    }, 
    {
      '$set': update#{ itemToUpdate:newContents } 
    },
    upsert=False, # upsert = if thing does not exist, make it exist
    return_document=ReturnDocument.AFTER # need this or else it returns the document from before the update
    )
  if (updated is None): # if there is no match
    return jsonify({'result':'no match'})
  
  fickleID = updated.pop('_id') # jasonify() doens't know how to handle objects of type ObjectID, so we remove it
  updated.update({'_id': str(fickleID)}) # put _id back in but as a regular string now

  return jsonify(updated)

# delete
@app.route('/delete_question', methods=['DELETE']) 
def delete_question(question_ID = '6065f38bac9dc35cb433ea88' ):#tags = ['beep boop', 'noop', 'yoop', 'ploop'] ):
  found = mongo.db.questions.find_one({'_id':ObjectId(question_ID)})#{'tags': { '$all': [x.lower() for x in tags] }}) #finds the entry with the exact set of tags
  if (found is None):
    return jsonify({'result':'no match'})

  found2 = mongo.db.questions.find({'related questions':str(found['_id'])})
  # we can delete it if no question is refrencing it
  if (found2.count() == 0):
    to_delete = mongo.db.questions.delete_one({'_id': found['_id']})
    if (to_delete.deleted_count == 0): #if there is no match
      return jsonify({'result':'no match'})
    
    return jsonify({'result':'deleted'})
  else:
    list = []
    for i in found2: # itterate over curor 
      fickleID = i.pop('_id') # jasonify() doens't know how to handle objects of type ObjectID, so we remove it
      i.update({'_id': str(fickleID)}) # put _id back in but as a regular string now
      list.append(i)
    return jsonify(list)

# add a field for a contact
@app.route('/put_contact', methods=['PUT']) # give an existing question a contact, returns updated document
def put_contact(tags = ['beep boop', 'noop', 'yoop', 'ploop'], contact_id = '600bb398d59727f52ed1de3c' ):
  # check if this contact actually exists
  found = mongo.db.contacts.find({'_id':ObjectId(contact_id)}) 
  if (found.count() == 0):
    return jsonify({'result':'no contact exists with this id'})
  else:
    updated = mongo.db.questions.find_one_and_update(
      {
        'tags': { '$all': [x.lower() for x in tags] } 
      }, 
      {
        '$set': { 'contact_id':contact_id }
      },
      upsert=True, # upsert = if thing does not exist, make it exist
      return_document=ReturnDocument.AFTER # need this or else it returns the document from before the update
      )
    if (updated is None): #if there is no match
      return jsonify({'result':'no match'})

    fickleID = updated.pop('_id') # jasonify() doens't know how to handle objects of type ObjectID, so we remove it
    updated.update({'_id': str(fickleID)}) # put _id back in but as a regular string now

    return jsonify(updated)

# add a field for follow up question
@app.route('/put_related_question', methods=['PUT']) 
def put_related_question(id = '607db3807d8d43d7bc1335df', related_question_ID = '6065f38bac9dc35cb433ea88'):
  found = mongo.db.questions.find({'_id':ObjectId(related_question_ID)}) 
  if (found.count() == 0):
    return jsonify({'result':'no question exists with this id'})
  else:
    updated = mongo.db.questions.find_one_and_update( 
      {
        '_id': ObjectId(id) 
      }, 
      {
        '$set': { 'related question': related_question_ID } 
      },
      upsert=True, # upsert = if thing does not exist, make it exist
      return_document=ReturnDocument.AFTER
      )
    if (updated is None): # if there is no match
      return jsonify({'result':'no match'})

    fickleID = updated.pop('_id') # jasonify() doens't know how to handle objects of type ObjectID, so we remove it
    updated.update({'_id': str(fickleID)}) # put _id back in but as a regular string now

    return jsonify(updated) #return result as json

# add a field for a link 
@app.route('/put_links', methods=['PUT']) 
def put_link(id = '607db3807d8d43d7bc1335df', link = 'https://www.faqtest.com/example%27FAQ\t\r\npppp'):
  updated = mongo.db.questions.find_one_and_update( 
    {
      '_id' : ObjectId(id) #'tags': { '$all': [x.lower() for x in tags] } 
    }, 
    {
      '$addToSet': { 'links': link } # $addToSet makes an array if there is none, adds to the arrray if there is                  repr() returns a printable representational string of the given object, here we use it so that it ignores return characters and reads it as a simple string
    },
    upsert=True, # upsert = if thing does not exist, make it exist
    return_document=ReturnDocument.AFTER
    )
  if (updated is None): # if there is no match
    return jsonify({'result':'no match'})

  fickleID = updated.pop('_id') # jasonify() doens't know how to handle objects of type ObjectID, so we remove it
  updated.update({'_id': str(fickleID)}) # put _id back in but as a regular string now

  return jsonify(updated) #return result as json

# delete one field
@app.route('/remove_one_field', methods=['PUT']) # delete a field from a question found based on tags
def remove_one_field(id_of_question_with_field = '607db3807d8d43d7bc1335df', field = 'related question'): # tags = ['beep boop', 'noop', 'yoop', 'ploop'], field = 'related questions'
  found = mongo.db.questions.find_one_and_update( 
    {
      '$and': [
        {'_id':ObjectId(id_of_question_with_field)},#{'tags': { '$all': [x.lower() for x in tags] }},
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

# remove one element from a spcified array field in a question
@app.route('/remove_one_element', methods=['PUT']) 
def remove_one_element(id_of_question_with_array = '607db3807d8d43d7bc1335df', id_of_element = 'https://www.faqtest.com/example%27FAQ\t\r\npppp', array_name='links'):
  found = mongo.db.questions.find_one_and_update( 
    {
      '_id':ObjectId(id_of_question_with_array)
    }, 
    {
      '$pull' : {array_name : id_of_element}
    },
    return_document=ReturnDocument.AFTER
    )
  if (found is None): # if there is no match
    return jsonify({'result':'no match'})

  if not found[array_name]: # delete the whole links field if the deletion makes it empty
    remove_one_field(id_of_question_with_array, array_name)

  fickleID = found.pop('_id') # jasonify() doens't know how to handle objects of type ObjectID, so we remove it
  found.update({'_id': str(fickleID)}) # put _id back in but as a regular string now

  return jsonify(found) #return result as json

# search for a question using an ObjectID
@app.route('/get_question_via_ID', methods=['GET']) # retrive a question based on id
def get_question_via_ID( _id = '6065f38bac9dc35cb433ea88' ):
  found = mongo.db.questions.find_one({'_id': ObjectId(_id) })

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

# add a field for a link 
@app.route('/put_staff_link', methods=['PUT']) 
def put_staff_link(contact_id = '600bb398d59727f52ed1de3c', link = 'beepBoop.ucf.csit.com'):
  found = mongo.db.contacts.find({'_id':ObjectId(contact_id)}) 
  if (found.count() == 0):
    return jsonify({'result':'no contact exists with this id'})
  else:
    updated = mongo.db.contacts.find_one_and_update( 
      {
        '_id': ObjectId(contact_id) 
      }, 
      {
        '$set': { 'link': link }
      },
      upsert=True, # upsert = if thing does not exist, make it exist
      return_document=ReturnDocument.AFTER
      )
    if (updated is None): # if there is no match
      return jsonify({'result':'no match'})

    fickleID = updated.pop('_id') # jasonify() doens't know how to handle objects of type ObjectID, so we remove it
    updated.update({'_id': str(fickleID)}) # put _id back in but as a regular string now

    return jsonify(updated) #return result as json


## tags collection ##

# create - tag name & tag type
@app.route('/add_tag', methods=['POST']) # add a tag to the database with name, and type, returns this new document. pls check if it exists first.
def add_tag( name = 'testo',  type = 'cat'):
  new_tag = {'name': name, 'type': type} # we make sure all tags are lower case
  
  InsertOneResult_Obj = mongo.db.tags.insert_one(new_tag) # insert_one() doesn't return a document, it returns a result that contains the ObjectID
  
  new_tag.update({'_id':str(InsertOneResult_Obj.inserted_id)}) # append new_question with the ObjectID (as a string) so that we can actually return something that resembles a document :/
 
  return jsonify(new_tag)

# search tags
@app.route('/get_tag', methods=['GET'])
def get_tag( name = 'testo', type = 'cat' ):
  found = mongo.db.tags.find_one(
    {
      '$and': [
        {'name':name},
        {'type':type}
      ]
    }

  ) #finds the entry with the exact name and type

  if (found is None): # if there is no match
    return jsonify({'result':'no match'})

  fickleID = found.pop('_id') # jasonify() doens't know how to handle objects of type ObjectID, so we remove it
  found.update({'_id': str(fickleID)}) # put _id back in but as a regular string now

  return jsonify(found) #return result as json

# update
@app.route('/update_tag', methods=['PUT']) # give an existing tag a file, returns updated document
def update_tag(old_dict = {'_id':'606e229c6770b2683d9d44ad', 'name':'testo', 'type':'cat'}, update = {'name':'testo2', 'type':'cat'}):
  updated = mongo.db.tags.find_one_and_update(
    {
      '_id': ObjectId(old_dict['_id'])
    }, 
    {
      '$set': update
    },
    return_document=ReturnDocument.AFTER # need this or else it returns the document from before the update
    )
  if (updated is None): #if there is no match
    return jsonify({'result':'no match'})

  fickleID = updated.pop('_id') # jasonify() doens't know how to handle objects of type ObjectID, so we remove it
  updated.update({'_id':str(fickleID)}) # put _id back in but as a regular string now

  # update all questions which use this tag
  replace_all_with_tag(old_dict['name'], old_dict['type'], update['name'])

  return jsonify(updated)

# Order for Tags:
# 1. Intent (intents)
# 2. Department (dept)
# 3. Category (cat)
# 4. Information (info)

# update all questions in the database with this tag
#@app.route('/replace_all_with_tag', methods=['PUT']) 
def replace_all_with_tag( tag = 'ploop', type = 'info', replace = 'presto' ):
  element = -1
  if (type == 'intents'):
    element = 0
  elif (type == 'dept'):
    element = 1
  elif (type == 'cat'):
    element = 2
  elif (type == 'info'):
    element = 3
  else:
    return jsonify({'result':'incorrect type. valid types: intents, dept, cat, info'})

  found = mongo.db.questions.update_many(
    {
      'tags.'+str(element):tag
    },
    {
      '$set': { 'tags.'+str(element):replace }
    },
    upsert=False, # upsert = if thing does not exist, make it exist
    )
  
  if (found is None): # if it comes back empty
    return jsonify({'result':'no results'})

  return jsonify(found.acknowledged) # update_many doesn't return a document

# delete - garbage collection, cannot delete if a question exists
@app.route('/delete_tag', methods=['DELETE']) 
def delete_tag(name = 'ploop', type = 'info'):
  element = -1
  if (type == 'intents'):
    element = 0
  elif (type == 'dept'):
    element = 1
  elif (type == 'cat'):
    element = 2
  elif (type == 'info'):
    element = 3
  else:
    return jsonify({'result':'incorrect type. valid types: intents, dept, cat, info'})

  # if no question is using this tag, we may delete it:
  found = mongo.db.questions.find({'tags.'+str(element):name}) 
  if (found.count() == 0):
    to_delete = mongo.db.tags.delete_one(
      {
        '$and': [
          {'name':name},
          {'type':type}
        ]
      }
      )
    if (to_delete.deleted_count == 0): #if there is no match
      return jsonify({'result':'no match'})
    
    return jsonify({'result':'deleted'})
  else:
    list = []
    for i in found: # itterate over curor 
      fickleID = i.pop('_id') # jasonify() doens't know how to handle objects of type ObjectID, so we remove it
      i.update({'_id': str(fickleID)}) # put _id back in but as a regular string now
      list.append(i)

    return jsonify(list)
  

## links collection ##
# create 
@app.route('/add_link', methods=['POST']) # add a link document to the database. pls check if it exists first.
def add_link( id = '607dc267b3c05a398fe29f12', name = 'link1',   link = 'thisisalink.png'): 
  new_link = {'_id' : ObjectId(id), 'name': name, 'link':link}
  
  InsertOneResult_Obj = mongo.db.links.insert_one(new_link) # insert_one() doesn't return a document, it returns a result that contains the ObjectID
  
  new_link.update({'_id':str(InsertOneResult_Obj.inserted_id)}) # append new_question with the ObjectID (as a string) so that we can actually return something that resembles a document :/
 
  return jsonify(new_link)

# search links
@app.route('/get_link', methods=['GET']) # retrive a link based on ObjectId
def get_link( id = '607dc267b3c05a398fe29f12' ):
  found = mongo.db.links.find_one({'_id': ObjectId(id)}) #finds the entry with the exact set of Tags

  if (found is None): # if there is no match
    return jsonify({'result':'no match'})

  fickleID = found.pop('_id') # jasonify() doens't know how to handle objects of type ObjectID, so we remove it
  found.update({'_id': str(fickleID)}) # put _id back in but as a regular string now

  return jsonify(found) #return result as json

# update
@app.route('/update_link', methods=['PUT']) # takes in a links id and updates the document based on a dictionary, returns updated document
def update_link(id= '607dc267b3c05a398fe29f12', update = {'name':'testo file', 'link':'html go brrrr'}):
  updated = mongo.db.links.find_one_and_update(
    {
      '_id': ObjectId(id)
    }, 
    {
      '$set': update
    },
    return_document=ReturnDocument.AFTER # need this or else it returns the document from before the update
    )
  if (updated is None): #if there is no match
    return jsonify({'result':'no match'})

  fickleID = updated.pop('_id') # jasonify() doens't know how to handle objects of type ObjectID, so we remove it
  updated.update({'_id':str(fickleID)}) # put _id back in but as a regular string now

  return jsonify(updated)

# delete
@app.route('/delete_link', methods=['DELETE']) 
def delete_link(id = '607dc267b3c05a398fe29f12'):
  # if no question is using this link, we may delete it immediately:
  found = mongo.db.questions.find({'links':id}) # assumes questions link to link via _id stored as a string
  if (found.count() == 0):
    to_delete = mongo.db.links.delete_one(
      {
        '_id':ObjectId(id)
      }
      )
    if (to_delete.deleted_count == 0): #if there is no match
      return jsonify({'result':'no match'})
    return jsonify({'result':'deleted'})
  else: # if it is being used, delete every instance
    for i in found: # itterate over curor 
      remove_one_element(str(i['_id']),id, 'links')

    return jsonify({'result':'deleted'})


## users collection ##

# create 
@app.route('/add_user', methods=['POST']) # add a user to the database. pls check if it exists first.
def add_user( NID = 'ha42000', name = 'user1',  email = 'boop@boop.com', IsAdmin = False):
  new_user = {'NID': NID, 'name': name, 'email': email, 'IsAdmin':IsAdmin}
  
  InsertOneResult_Obj = mongo.db.users.insert_one(new_user) # insert_one() doesn't return a document, it returns a result that contains the ObjectID
  
  new_user.update({'_id':str(InsertOneResult_Obj.inserted_id)}) # append new_question with the ObjectID (as a string) so that we can actually return something that resembles a document :/
 
  return jsonify(new_user)

# search
@app.route('/get_user', methods=['GET']) # retrive a user based on ObjectId
def get_user( NID = 'ma770070' ):
  found = mongo.db.users.find_one({'NID': NID}) #finds the entry with the exact set of Tags

  if (found is None): # if there is no match
    return jsonify({'result':'no match'})

  fickleID = found.pop('_id') # jasonify() doens't know how to handle objects of type ObjectID, so we remove it
  found.update({'_id': str(fickleID)}) # put _id back in but as a regular string now

  return jsonify(found) #return result as json

# update
@app.route('/update_user', methods=['PUT']) # give an existing tag a file, returns updated document
def update_user(NID = 'ma770070', itemToUpdate = 'name', newContents = 'Maya2'):
  updated = mongo.db.users.find_one_and_update(
    {
      'NID': NID
    }, 
    {
      '$set': { itemToUpdate:newContents }
    },
    return_document=ReturnDocument.AFTER # need this or else it returns the document from before the update
    )
  if (updated is None): #if there is no match
    return jsonify({'result':'no match'})

  fickleID = updated.pop('_id') # jasonify() doens't know how to handle objects of type ObjectID, so we remove it
  updated.update({'_id':str(fickleID)}) # put _id back in but as a regular string now

  return jsonify(updated)

# delete
@app.route('/delete_user', methods=['DELETE']) 
def delete_user(NID = 'ha42000'):
  to_delete = mongo.db.users.delete_one(
    {
      'NID':NID
    }
    )
  if (to_delete.deleted_count == 0): #if there is no match
    return jsonify({'result':'no match'})
  
  return jsonify({'result':'deleted'})

# check if a user is an admin
@app.route('/IsAdmin_check', methods=['GET']) 
def IsAdmin_check(NID = 'ha2000'):
  found = mongo.db.users.find_one({'NID':NID}) 

  if (found is None): # if there is no match
    return jsonify({'result':'no match'})

  # just driectly return the value of IsAdmin
  return jsonify({'result':found['IsAdmin']})


## settings collection ##

# checks if there needs training
@app.route('/needs_update_check', methods=['GET']) 
def needs_update_check():
  found = mongo.db.settings.find_one({'needs training':'Needs Training'}) 

  if (found is None): # if there is no match
    return jsonify({'needs training':'Fully Trained'})

  return jsonify({'needs training':'Needs Training'}) #return result as json

# changes the status of needs training
@app.route('/set_needs_update', methods=['PUT'])
def set_needs_update(set = 'Fully Trained'):
  if ((set.title() != 'Fully Trained') and (set.title() != 'Needs Training')): # .title() ensures "needs training" has only the first letter of each word capitalized, with the other letters lower case
    return jsonify({'result':'not a valid setting'})

  updated = mongo.db.settings.find_one_and_update(
    {}, 
    {
      '$set': { 'needs training':set.title() } 
    },
    upsert=False, # upsert = if thing does not exist, make it exist
    return_document=ReturnDocument.AFTER # need this or else it returns the document from before the update
    )
  if (updated is None): #if there is no match
    return jsonify({'result':'no match'})

  fickleID = updated.pop('_id') # jasonify() doens't know how to handle objects of type ObjectID, so we remove it
  updated.update({'_id':str(fickleID)}) # put _id back in but as a regular string now

  return jsonify(updated)


#TODO IGNORE FOR NOW: list of ids of questions that have been recently added need to be retrained. 
# # When the 'delete question' is called, check to see if this array is size 0 and then if it is, change the 'needs training' variable to 'fully trained'. 
# # When the system is trained, clear this list. 
# # If user adds a question, add to this list.


## statisctics collection ## 
# did you get an answer to your question? (Y/N) did you enjoy knugbot feed him carrots (1-5)?, how easy was your interaction with knugbot? [very simple]-[simple]-[complicated]-[very complicated]?
# create
@app.route('/add_stat', methods=['POST'])
def add_stat(answered = 'yes', rating=4, simplicity=5):
  new_stat = {'answered': answered, 'rating': rating, 'simplicity': simplicity, 'date/time added': datetime.today().strftime(date_time_format) }
  
  InsertOneResult_Obj = mongo.db.statistics.insert_one(new_stat) # insert_one() doesn't return a document, it returns a result that contains the ObjectID
  
  new_stat.update({'_id':str(InsertOneResult_Obj.inserted_id)}) # append new_stat with the ObjectID (as a string) so that we can actually return something that resembles a document :/
 
  return jsonify(new_stat)

# read
# use return_all(statistics)

# update
# no need to update these

# delete
@app.route('/delete_stat', methods=['DELETE']) 
def delete_stat(id):
  to_delete = mongo.db.statistics.delete_one(
    {
      '_id':id
    }
    )
  if (to_delete.deleted_count == 0): #if there is no match
    return jsonify({'result':'no match'})
  
  return jsonify({'result':'deleted'})

# TODO: Test if this even works, please
@app.route('/clear_stats', methods=['DELETE'])
def clear_stats(before_date = '2021-04-18 00:00:00'):
  before_date_time_obj = datetime.datetime.strptime(before_date, date_time_format)

  to_delete = mongo.db.statistics.date(
    {
    '$lte' : before_date_time_obj
    }
  )
  if (to_delete.deleted_count == 0): #if there is no match
    return jsonify({'result':'no match'})
  
  return jsonify({'result':'deleted'})


## unseen questions collection ##
# create
@app.route('/add_unseen', methods=['POST'])
def add_unseen(question = 'what is knugget\'s favorite food?'):
  new_question = {'question':question, 'date/time added': datetime.datetime.now() }
  
  InsertOneResult_Obj = mongo.db.unseen.insert_one(new_question) # insert_one() doesn't return a document, it returns a result that contains the ObjectID
  
  new_question.update({'_id':str(InsertOneResult_Obj.inserted_id)}) # append new_question with the ObjectID (as a string) so that we can actually return something that resembles a document :/
 
  return jsonify(new_question)

# read
@app.route('/get_unseen', methods=['GET'])
def get_unseen(id):
  found = mongo.db.unseen.find_one({'_id': id}) #finds the entry with the exact set of Tags

  if (found is None): # if there is no match
    return jsonify({'result':'no match'})

  fickleID = found.pop('_id') # jasonify() doens't know how to handle objects of type ObjectID, so we remove it
  found.update({'_id': str(fickleID)}) # put _id back in but as a regular string now

  return jsonify(found) #return result as json

# update
# we don't need to update these

# delete
@app.route('/delete_stat', methods=['DELETE']) 
def delete_unseen(id ):
  to_delete = mongo.db.unseen.delete_one(
    {
      '_id':id
    }
    )
  if (to_delete.deleted_count == 0): #if there is no match
    return jsonify({'result':'no match'})
  
  return jsonify({'result':'deleted'})



if __name__ == '__main__':
    app.run(debug=True) #run in debug mode so that when the .py updates, the whole thing relaunches too
