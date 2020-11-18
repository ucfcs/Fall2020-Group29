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
def get_questions():
  questions = mongo.db.questions
  output = []
  for s in questions.find(): #return all patterns
    output.append({'patterns' : s['patterns']})
  for i in questions.find({'context':'CS'}): #only show responses where context is CS
    output.append({'responses' : i['responses']})
  return jsonify({'result' : output})

if __name__ == '__main__':
    app.run(debug=True)
