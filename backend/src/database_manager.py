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


def return_all(mongo, collection='questions'):
  found = mongo.db[collection].find({})
  
  if (found is None): # if it comes back empty
    return jsonify({'result':'no results'})

  list = []
  for i in found: # itt=erate over cursor 
    fickleID = i.pop('_id') # jsonify() doesn't know how to handle objects of type ObjectID, so we remove it
    i.update({'_id': str(fickleID)}) # put _id back in but as a regular string now
    list.append(i)

  return list #return result 

def add_question(mongo, name, responses, tags, patterns):
  new_question = {'name': name, 'responses': responses, 'tags':tags, 'patterns': patterns}
  # insert_one() doesn't return a document, it returns a result that contains the ObjectID
  InsertOneResult_Obj = mongo.db.questions.insert_one(new_question)
  # append new_question with the ObjectID (as a string) so that we can actually return something that resembles a document :/
  new_question.update({'_id':str(InsertOneResult_Obj.inserted_id)}) 
 
  return jsonify(new_question)


def update_question(mongo, id, update_dict):
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
    return None
  
  fickleID = updated.pop('_id') # jsonify() doens't know how to handle objects of type ObjectID, so we remove it
  updated.update({'_id': str(fickleID)}) # put _id back in but as a regular string now

  return updated
