# app.py
from flask import Flask, request, jsonify
app = Flask(__name__)

@app.route('/', methods=['GET'])
def index():
    return "<h1>Hello World</h1> <p>I bought a domain name</p> <small>Did you know .fish was allowed? Me neither</small>"
