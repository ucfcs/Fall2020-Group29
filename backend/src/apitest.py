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
def get_question(entities = ['BS-to_MS', 'How', 'Sign Up']):
  found = mongo.db.questions.find({'Entities': { '$all': entities }}) #finds the entry with the exact set of entities
  # found gives a cursor object
  # when I try to jsonify found I recive: 
  #    TypeError: Object of type Cursor is not JSON serializable 
  output = []
  if found:
    for i in found: 
      output.append({'Name' : i['Name'], 'responses':i['responses'], 'patterns':i['patterns']}) #records the name, responses, and patterns 
  else:
    output.append({'result ofsearc':'nothing found'})

  return jsonify({'result' : output})

'''
@app.route('/star/', methods=['GET'])
def get_one_star(name):
  star = mongo.db.stars
  s = star.find_one({'name' : name})
  if s:
    output = {'name' : s['name'], 'distance' : s['distance']}
  else:
    output = "No such name"
  return jsonify({'result' : output})
'''


@app.route('/add_question', methods=['POST'])
def add_questions(name = "BS-to_MS", response = "In order to dah da da da da", entities = ['BS-to-MS', 'How', 'Sign Up'] ):
  questions = mongo.db.questions
  questions_id = questions.insert({'Name': name, 'response': response, 'entities':entities})
  new_questions = questions.find_one({'_id': questions_id })
  output = {'Name' : new_questions['Name'], 'response' : new_questions['response'], 'entities':new_questions['entities']}
  return jsonify({'result' : output})
'''
newPattern= "how do I post things"
newResponse = "like this"
newContext = ["general", "flask"]


@app.route('/questions', methods=['POST'])
def add_questions(pattern = newPattern, response = newResponse, context = newContext):
  questions = mongo.db.questions
  questions_id = questions.insert({'pattern': pattern, 'response': response, 'context':context})
  new_questions = questions.find_one({'_id': questions_id })
  output = {'pattern' : new_questions['pattern'], 'response' : new_questions['response'], 'context':new_questions['context']}
  return jsonify({'result' : output})
'''
if __name__ == '__main__':
    app.run(debug=True) #run in debug mode so that when the .py updates, the whole thing relaunches too
