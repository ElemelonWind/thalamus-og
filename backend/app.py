from flask import Flask, Response
from flask_restful import Resource, Api, reqparse
import time

app = Flask(__name__)
api = Api(app)

def generate():
        for i in range(5):
            time.sleep(1)  # Simulate processing
            yield f"data: Message {i}\n\n"  # Send data as a chunk to the client

class MyResponse(Resource):
    def get(self):
        # SSE
        return Response(generate(), content_type='text/event-stream')
    
    

api.add_resource(MyResponse, '/response')

if __name__ == '__main__':
    app.run(debug=True)