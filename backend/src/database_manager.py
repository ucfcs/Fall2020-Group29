from flask import jsonify

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

