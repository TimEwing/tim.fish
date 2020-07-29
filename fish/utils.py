from flask import request, jsonify, url_for, redirect

from .config import Urls, Templates

# Helper function for re-rendering base.html with all the context it needs
def render_base(target):
    context = {}
    urls = {f'{k}_url': v for k,v in Urls.to_dict().items()}
    context.update(urls)
    templates = {f'{k}_template': v for k,v in Templates.to_dict().items()}
    context.update(templates)
    
    if not target:
        context['target'] = '/home/'

    return Templates.base.render(context)

# Wrapper for ajax-content views
# Function need only return a dict; errors are handled
# Dict expects title and content fields
def ajax(function):
    def wrapper(*args, **kwargs):
        # Verify the request is ajax
        request_xhr_key = request.headers.get('X-Requested-With')
        if request_xhr_key and request_xhr_key == 'XMLHttpRequest':
            return jsonify(function(*args, **kwargs))
        else:
            # Render base template with this page as the target
            return render_base(request.full_path)
    # Flask requires unique function __name__s
    wrapper.__name__ = function.__name__
    return wrapper
