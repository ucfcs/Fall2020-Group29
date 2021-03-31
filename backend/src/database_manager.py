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

def return_all(mongo, Collection = 'questions'):
  found = mongo.db[Collection].find({})
  
  if (found is None): # if it comes back empty
    return jsonify({'result':'no results'})

  list = []
  for i in found: # itterate over curor 
    fickleID = i.pop('_id') # jasonify() doens't know how to handle objects of type ObjectID, so we remove it
    i.update({'_id': str(fickleID)}) # put _id back in but as a regular string now
    list.append(i)

  return jsonify(list) #return result as json