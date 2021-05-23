import traceback

from werkzeug.exceptions import HTTPException

from .utils import render_base, ajax, get_base_context
from .config import app, Urls, Templates, errors


@app.errorhandler(Exception)
@ajax
def handle_error(e):
    if isinstance(e, HTTPException):
        error_code = e.code
    else:
        error_code = 500

    error_name, error_text, error_subtext = errors[e.code]

    if error_code == 500:
        traceback.print_exc()

    context = {
        'error_code': error_code,
        'error_name': error_name,
        'error_text': error_text,
        'error_subtext': error_subtext,
    }

    output = {}
    output['title'] = f"Error {error_code}"
    output['content'] = Templates.error.render(context)
    return output


@app.route('/welcome/')
def welcome():
    context = get_base_context()
    return Templates.welcome.render(context)


@app.route('/')
@ajax
def home():
    output = {}
    output['title'] = "tim.fish - Home"
    context = get_base_context()
    output['content'] = Templates.home.render(context)
    return output


@app.route(Urls.projects)
@ajax
def projects():
    output = {}
    output['title'] = "tim.fish - Projects"
    context = get_base_context()
    output['content'] = Templates.projects.render(context)
    return output


@app.route(Urls.kepler)
@ajax
def kepler():
    output = {}
    output['title'] = "tim.fish - kepler"
    context = get_base_context()
    output['content'] = Templates.kepler.render(context)
    return output
