from flask import jsonify
from pymongo import ReturnDocument, MongoClient # so that we can return the updated version of the document after updating it
from bson.objectid import ObjectId

def get_intents():
    return jsonify(intents=[
        {
            'tag':'test',
            'patterns':['test1', 'test2', 'test3'],
            'responses':['Oh hey, nice test!'],
            'context':[]
        }
    ])

def return_all(mongo, Collection = 'questions'):
  found = mongo.db[Collection].find({})
  
  if (found is None): # if it comes back empty
    return jsonify({'result':'no results'})

  list = []
  for i in found: # itt=erate over cursor 
    fickleID = i.pop('_id') # jsonify() doesn't know how to handle objects of type ObjectID, so we remove it
    i.update({'_id': str(fickleID)}) # put _id back in but as a regular string now
    list.append(i)

  return list #return result 

def add_question(mongo, question):
  exists, q_name = check_question_exists(mongo, '', question['tags'])

  if exists:
    return None, q_name
  
  new_question = question
  # insert_one() doesn't return a document, it returns a result that contains the ObjectID
  InsertOneResult_Obj = mongo.db.questions.insert_one(new_question)
  # append new_question with the ObjectID (as a string) so that we can actually return something that resembles a document :/
  new_question.update({'_id':str(InsertOneResult_Obj.inserted_id)}) 
 
  return new_question, ''


def update_question(mongo, id, update_dict):
  exists, q_name = check_question_exists(mongo, id, update_dict['tags'])

  if exists:
    return None, q_name

  updated = mongo.db.questions.find_one_and_update(
    {
      '_id': ObjectId(id)
    }, 
    {
      '$set': update_dict
    },
    upsert=False, # upsert = if thing does not exist, make it exist
    return_document=ReturnDocument.AFTER # need this or else it returns the document from before the update
    )
  if (updated is None): # if there is no match
    return None, ''
  
  fickleID = updated.pop('_id') # jsonify() doens't know how to handle objects of type ObjectID, so we remove it
  updated.update({'_id': str(fickleID)}) # put _id back in but as a regular string now

  return updated, ''

def check_question_exists(mongo, id, tags):
  result = mongo.db.questions.find_one({
    "tags" : {
      "$all":tags
      }
    })
  if result is None:
    return False, ''
  else:
    check = result['_id']
    if str(check) != id:
      return True, result['name']
    return False, ''

def delete_question(mongo, id):
  result = mongo.db.questions.delete_one({'_id':ObjectId(id)})
  if result.deleted_count == 1:
    return True, 'Question successfully deleted'
  else:
    return False, 'Question could not be found'


def add_tag(mongo, name, type):
  new_tag = {'name': name, 'type': type} # we make sure all tags are lower case
  if (check_tag_exists(mongo, name, type)):
    return None
  
  InsertOneResult_Obj = mongo.db.tags.insert_one(new_tag) # insert_one() doesn't return a document, it returns a result that contains the ObjectID
  
  new_tag.update({'_id':str(InsertOneResult_Obj.inserted_id)}) # append new_question with the ObjectID (as a string) so that we can actually return something that resembles a document :/
 
  return new_tag

def check_tag_exists(mongo, name, type):
  result = mongo.db.tags.find_one({
    "name": name,
    "type": type
  })
  return result is not None


def update_tag(mongo, old_dict, update):
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
    return None

  fickleID = updated.pop('_id') # jasonify() doens't know how to handle objects of type ObjectID, so we remove it
  updated.update({'_id':str(fickleID)}) # put _id back in but as a regular string now

  return_all_with_tag(mongo, old_dict['name'], old_dict['type'], update['name'])

  return updated

def delete_tag(mongo, id, name, type):
  element = -1
  if (type == 'intent'):
    element = 0
  elif (type == 'department'):
    element = 1
  elif (type == 'category'):
    element = 2
  elif (type == 'information'):
    element = 3
  else:
    return False, 'Tag has invalid type'

  # if no question is using this tag, we may delete it:
  found = mongo.db.questions.find({'tags.'+str(element):name}) 
  if (found.count() == 0):
    to_delete = mongo.db.tags.delete_one({'_id':ObjectId(id)})
    if (to_delete.deleted_count == 0): #if there is no match
      return False, 'Tag could not be found'
    else:
      return True, 'Tag successfully deleted'
  else:
    return False, 'Tag has dependent questions'

def check_valid_user(mongo, nid):
  result = mongo.db.users.find_one({
    "NID":nid
  })
  return result is not None

def add_user(mongo, user):
  new_user = user
  
  InsertOneResult_Obj = mongo.db.users.insert_one(new_user) # insert_one() doesn't return a document, it returns a result that contains the ObjectID

  if new_user is None:
    return None
  
  new_user.update({'_id':str(InsertOneResult_Obj.inserted_id)}) # append new_question with the ObjectID (as a string) so that we can actually return something that resembles a document :/
 
  return new_user

def update_user(mongo, id, NID, name, email, IsAdmin):
  updated = mongo.db.users.find_one_and_update(
    {
      '_id': ObjectId(id)
    }, 
    {
      '$set': { 'NID':NID, 'name':name, 'email':email, 'IsAdmin':IsAdmin}
    },
    return_document=ReturnDocument.AFTER # need this or else it returns the document from before the update
    )
  if (updated is None): #if there is no match
    return None

  fickleID = updated.pop('_id') # jasonify() doens't know how to handle objects of type ObjectID, so we remove it
  updated.update({'_id':str(fickleID)}) # put _id back in but as a regular string now

  return updated

def delete_user(mongo, id):
  to_delete = mongo.db.users.delete_one(
    {
      '_id':ObjectId(id)
    }
    )
  if (to_delete.deleted_count == 0): #if there is no match
    return False, 'User not found.'
  
  return True, 'User successfully deleted.'


# Order for Tags:
# 1. Intent (intents)
# 2. Department (dept)
# 3. Category (cat)
# 4. Information (info)

# update all questions in the database with this tag
def return_all_with_tag(mongo, tag, type, replace):
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

  return found.acknowledged # update_many doesn't return a document

def needs_update_check(mongo):
  found = mongo.db.settings.find_one({'name':'needs training'}) 

  if (found is None): # if there is no match
    return None

  return found['needs training'] #return result  setting

def set_needs_update(mongo, value='Needs Training'):
  updated = mongo.db.settings.find_one_and_update(
    {'name':'needs training'}, 
    {
      '$set': { 'needs training':value }
    },
    upsert=False, # upsert = if thing does not exist, make it exist
    return_document=ReturnDocument.AFTER # need this or else it returns the document from before the update
    )
  if (updated is None): #if there is no match
    return False

  return True