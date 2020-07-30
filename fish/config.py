import os

from flask import Flask
from jinja2 import Environment, FileSystemLoader, select_autoescape

#Flask setup
app = Flask(__name__)

# Jinja setup
template_dir = os.path.join(os.path.dirname(__file__), 'templates')
env = Environment(
    loader=FileSystemLoader([template_dir]),
    autoescape=select_autoescape(['html'])
)

# Root class that has a nice to_dict function so we can pass it to templates
class StorageClass():
    @classmethod
    def to_dict(cls):
        # Filter out any vars that start with _
        var_dict = {k:v for k, v in vars(cls).items() if not k.startswith('_')}
        # Filter out callables (functions)
        var_dict = {k:v for k, v in var_dict.items() if not callable(v)}
        return var_dict

class Urls(StorageClass):
    home = '/'
    projects = '/projects/'
    omni = '/projects/omni/'
    kepler = '/projects/kepler/'

class Templates(StorageClass):
    base = env.get_template('base.html')
    home = env.get_template('home.html')
    # projects = env.get_template('projects.html')
    # omni = env.get_template('omni.html')
    kepler = env.get_template('kepler.html')
