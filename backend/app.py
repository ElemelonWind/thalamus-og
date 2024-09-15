import os
import time
from flask import Flask, Response
from flask_restful import Resource, Api
from autogen import ConversableAgent
from flask_cors import CORS
import json
from backend_api.route import route_query  # Import the route_query function
from backend_api import thalamus

app = Flask(__name__)
api = Api(app)
CORS(app)  # Enable CORS for all routes

def generate(query):
    for chunk in route_query(query):
        message = {'data': chunk}
        yield f"data: {json.dumps(message)}\n\n"
    yield 'data: END\n\n'

class MyResponse(Resource):
    def get(self):
        query = "What Large Language Model are you"  # You might want to get this from a request parameter
        return Response(generate(query), content_type='text/event-stream')

api.add_resource(MyResponse, '/response')

if __name__ == '__main__':
    app.run(debug=True)