import os

from flask import Flask, request, jsonify
from jinja2 import Environment, FileSystemLoader, select_autoescape

app = Flask(__name__)
template_dir = os.path.join(os.path.dirname(__file__), 'templates')
env = Environment(
    loader=FileSystemLoader(template_dir),
    autoescape=select_autoescape(['html'])
)



@app.route('/', methods=['GET'])
def index():
    template = env.get_template('base.html')
    return template.render()

