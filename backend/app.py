import os
import time
from flask import Flask, Response, request
from flask_restful import Resource, Api
from autogen import ConversableAgent
from flask_cors import CORS
import json
from backend_api.route import route_query  # Import the route_query function
from backend_api import thalamus
import re

app = Flask(__name__)
api = Api(app)
CORS(app)  # Enable CORS for all routes

def strip_ansi(text):
    ansi_escape = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])')
    return ansi_escape.sub('', text)

def generate(query):
    for chunk in route_query(query):
        clean_chunk = strip_ansi(str(chunk.strip()))
        message = {'data': clean_chunk}
        print(clean_chunk)
        yield f"data: {json.dumps(message)}\n\n"
    yield 'data: END\n\n'

class MyResponse(Resource):
    def get(self):
        message = request.args.get("message")
        performance = request.args.get("performance")
        query = message  # You might want to get this from a request parameter
        return Response(generate(query), content_type='text/event-stream')

api.add_resource(MyResponse, '/response')

if __name__ == '__main__':
    app.run(debug=True)