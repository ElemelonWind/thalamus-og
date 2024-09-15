from flask import Flask, Response
from flask_restful import Resource, Api, reqparse
import time
import json

app = Flask(__name__)
api = Api(app)

message = {
    'data': 'more stuff',
    'actions': ['action1', 'action2']
}

def generate():
        for i in range(5):
            time.sleep(1)  # Simulate processing
            yield 'data: ' + json.dumps(message) + '\n\n'
        yield 'data: END\n\n'

class MyResponse(Resource):
    def get(self):
        # SSE
        return Response(generate(), content_type='text/event-stream')
    
    

api.add_resource(MyResponse, '/response')

if __name__ == '__main__':
    app.run(debug=True)