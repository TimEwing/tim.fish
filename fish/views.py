from werkzeug.exceptions import HTTPException

from .utils import render_base, ajax
from .config import app, Urls, Templates, errors

@app.errorhandler(Exception)
@ajax
def handle_error(e):
    # Assume everything was a server error
    error_code = 500
    # If it wasn't, change the error code
    if isinstance(e, HTTPException):
        error_code = e.code
    # If we don't know that error code, go back to server error
    try:
        error_name, error_text, error_subtext = errors[error_code]
    except KeyError:
        error_name, error_text, error_subtext = errors[500]

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

@app.route('/')
@ajax
def base():
    output = {}
    output['title'] = "Home"
    output['content'] = Templates.home.render()
    return output

@app.route(Urls.kepler)
@ajax
def kepler():
    raise ValueError()
    output = {}
    output['title'] = "kepler"
    output['content'] = Templates.kepler.render()
    return output
