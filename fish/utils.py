from flask import request, session, jsonify, redirect

from .config import Urls, Templates

def get_base_context():
    context = {}
    urls = {f'{k}_url': v for k,v in Urls.to_dict().items()}
    context.update(urls)
    return context


# Helper function for re-rendering base.html with all the context it needs
def render_base(target):
    # If we haven't shown the welcome splash, show it
    if not session.get('created'):
        session['created'] = True
        return redirect(Urls.welcome)

    context = get_base_context()

    # Clean up urls with no query string
    target = target.rstrip('?')
    context['target'] = target or '/' # target = '/' if no target is passed

    return Templates.base.render(context)

# Wrapper for ajax-content views
# Function need only return a dict; errors are handled
# Dict expects title and content fields
def ajax(function):
    def wrapper(*args, **kwargs):
        # Check if the request is ajax
        request_xhr_key = request.headers.get('X-Requested-With')
        if request_xhr_key and request_xhr_key == 'XMLHttpRequest':
            # Request is ajax
            return jsonify(function(*args, **kwargs))
        else:
            # Request is not ajax
            # Render base template with this page as the target
            return render_base(request.full_path)
    # Flask requires unique function __name__s
    wrapper.__name__ = function.__name__
    return wrapper
