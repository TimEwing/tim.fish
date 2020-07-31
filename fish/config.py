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
    error = env.get_template('error.html')
    home = env.get_template('home.html')
    # projects = env.get_template('projects.html')
    # omni = env.get_template('omni.html')
    kepler = env.get_template('kepler.html')


# This should probably be in a json file
errors = {
    400: [
        "Bad Request",
        "Something went wrong, and the server said it's your fault.",
        "Go ask them about it.",
    ],
    401: [
        "Unauthorized",
        "The request contained valid data and was understood by the server, but the server is refusing action. How rude. ",
        "You probably need to log in.",
    ],
    403: [
        "Forbidden",
        "The request contained valid data and was understood by the server, but the server is refusing action. How rude. ",
        "You probably need to be me (Tim) instead of you (Not Tim).",
    ],
    404: [
        "Not Found",
        "There isn't anything here.",
        "Feel free to keep looking though.",
    ],
    405: [
        "Method Not Allowed",
        "Not sure how you raised this error, but that method (like GET or POST or PUT) isn't allowed.",
        "What are you doing?",
    ],
    406: [
        "Not Acceptable",
        "This page isn't good enough for you, apparently.",
        "It sounds like a you problem.",
    ],
    407: [
        "Proxy Authentication Required",
        "Authenticate with the proxy, silly.",
        "",
    ],
    408: [
        "Request Timeout",
        "The server got sick of waiting.",
        "Maybe be faster next time.",
    ],
    409: [
        "Conflict",
        "Honestly, I'm just impressed you found a way to raise this error.",
        "What did you do?!",
    ],
    410: [
        "Gone",
        "This page got deleted.",
        "Was it ever even here?",
    ],
    411: [
        "Length Required",
        "You didn't specify the length of your request.",
        "Try specifying the length of your request.",
    ],
    412: [
        "Precondition Failed",
        "This page isn't good enough for you, apparently.",
        "It sounds like a you problem.",
    ],
    413: [
        "Payload Too Large",
        "That file (or whatever) was too big.",
        "Try making it smaller.",
    ],
    414: [
        "URI Too Long",
        "The server said your URI was too long. You probably put too much stuff in the query string.",
        "Try making it shorter",
    ],
    415: [
        "Unsupported Media Type",
        "File type not supported.",
        "Sorry.",
    ],
    416: [
        "Range Not Satisfiable",
        "You asked for something the server doesn't have.",
        "Try asking again, I'm sure that will help.",
    ],
    417: [
        "Expectation Failed",
        "The server says you're being needy.",
        "The server is probably right.",
    ],
    418: [
        "I'm a teapot",
        "The server says that coffee machines cannot make tea.",
        "Sorry about that.",
    ],
    421: [
        "Misdirected Request",
        "Probably connection reuse.",
        "Don't do that.",
    ],
    422: [
        "Unprocessable Entity",
        "You asked for seven red lines, all of them strictly perpendicular; some with green ink and some with transparent.",
        "We can't do that.",
    ],
    423: [
        "Locked",
        "The resource that is being accessed is locked.",
        "Look for a key?",
    ],
    424: [
        "Failed Dependency",
        "The request failed because it depended on another request and that request failed.",
        "I hate it when that happens.",
    ],
    425: [
        "Too Early",
        "The server is unwilling to risk processing a request that might be replayed.",
        "They don't like taking risks.",
    ],
    426: [
        "Upgrade Required",
        "You should switch to a different protocol.",
        "It's in the Upgrade header field.",
    ],
    428: [
        "Precondition Required",
        "You need to add a precondition so the request doesn't get lost.",
        "I hate when I lose things.",
    ],
    429: [
        "Too Many Requests",
        "You're in time out.",
        "Come back when you've learned your lesson.",
    ],
    431: [
        "Request Header Fields Too Large",
        "Largeness of Request Header Fields is Too",
        "Request Header Fields Excessively Smalln't",
    ],
    451: [
        "Unavailable For Legal Reasons",
        "The server's lawyer said they aren't supposed to talk to you.",
        "I plead the 5th.",
    ],
    500: [
        "Internal Server Error",
        "Something terrible happened to the server.",
        "If you know what you did to break it, you should tell me.",
    ],
    501: [
        "Not Implemented",
        "I haven't done that bit yet.",
        "Sorry.",
    ],
    502: [
        "Bad Gateway",
        "Someone else's server is having a bad day.",
        "Sorry.",
    ],
    503: [
        "Service Unavailable",
        "The server is pretty busy right now and I felt weird interrupting.",
        "Maybe come back later. Sorry.",
    ],
    504: [
        "Gateway Timeout",
        "Someone else's server fell asleep while we were waiting for it.",
        "Someone grab them a coffee.",
    ],
    505: [
        "HTTP Version Not Supported",
        "Turns out enabling HTTPS is extra.",
        "",
    ],
    506: [
        "Variant Also Negotiates",
        "Something somewhere is a circular dependency.",
        "This error message requires error message 506.",
    ],
    507: [
        "Insufficient Storage",
        "I guess a free s3 wasn't enough.",
        "Oops.",
    ],
    508: [
        "Loop Detected",
        "The server detected an infinite loop while processing the request.",
        "Like in groundhog day.",
    ],
    510: [
        "Not Extended",
        "Further extensions to the request are required for the server to fulfil it.",
        "Try extending it.",
    ],
    511: [
        "Network Authentication Required",
        "You need to sign in to your coffee shop's wifi network.",
        "Or your airport's. Or whatever.",
    ],
}
