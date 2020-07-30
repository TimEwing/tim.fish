
from .utils import render_base, ajax
from .config import app, Urls, Templates

# Target is the url that will be loaded via ajax after base.html is loaded
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
    output = {}
    
    output['title'] = "kepler"
    output['content'] = Templates.kepler.render()
    return output