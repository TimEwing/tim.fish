# app.py
from flask import Flask, request, jsonify
app = Flask(__name__)

@app.route('/', methods=['GET'])
def index():
    return "<h1>Hello World</h1>"
