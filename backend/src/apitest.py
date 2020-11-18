from flask import Flask
from flask import jsonify
from flask import request
from flask_pymongo import PyMongo

app = Flask(__name__)

app.config['MONGO_DBNAME'] = 'ourDB'
app.config['MONGO_URI'] = 'mongodb://localhost:27017/ourDB'

mongo = PyMongo(app)

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

@app.route("/home")
def index_page():
    return "Home Page"

@app.route('/questions', methods=['GET'])
def get_all_questions():
  questions = mongo.db.questions
  output = []
  for s in questions.find():
    output.append({'patterns' : s['patterns']})
  for i in questions.find({'context':'CS'}): #only show responses where context is CS
    output.append({'responses' : i['responses']})
  return jsonify({'result' : output})



newPattern= "how do I post things"
newResponse = "like this"
newContext = ["general", "flask"]

@app.route('/questions', methods=['POST'])
def add_questions():
  questions = mongo.db.questions
  #pattern = request.json['pattern']
  #distance = request.json['distance']
  questions_id = questions.insert({'pattern': newPattern, 'response': newResponse, 'context':newContext})
  new_questions = questions.find_one({'_id': questions_id })
  output = {'pattern' : new_questions['pattern'], 'response' : new_questions['response'], 'context':new_questions['context']}
  return jsonify({'result' : output})

if __name__ == '__main__':
    app.run(debug=True) #run in debug mode so that when the .py updates, the whole thing relaunches too
