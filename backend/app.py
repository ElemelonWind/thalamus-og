import os
import time
from flask import Flask, Response
from flask_restful import Resource, Api
from autogen import ConversableAgent
from flask_cors import CORS
import json

app = Flask(__name__)
api = Api(app)
CORS(app)  # Enable CORS for all routes

# Initialize the Autogen agent
agent = ConversableAgent(
    "chatbot",
    llm_config={"config_list": [{"model": "gpt-4", "api_key": "sk-qTbIVMe5neqmkGQa3e_WMY1Oml15Wc5MOJ8VvnADfZT3BlbkFJk3kpZe5y5O80mwpvIdwFaExoMM-B4tiiZzLE7SFhkA"}]},
    code_execution_config=False,
    function_map=None,
    human_input_mode="NEVER",  # Never ask for human input.
)

message = {
    'data': 'more stuff',
    'actions': ['action1', 'action2']
}

def generate():
    # Example conversation, could be dynamic
    conversation = [
        {"role": "user", "content": "Hello!"},
        {"role": "user", "content": "What is the weather today?"},
        {"role": "user", "content": "Tell me a joke"},
        {"role": "user", "content": "Goodbye!"}
    ]
    
    for user_message in conversation:
        time.sleep(1)  # Simulate processing delay
        
        # Send user's message to the Autogen agent and get the response
        agent_response = agent.generate_reply(messages=[user_message])
        message['data'] = agent_response
        
        # Stream both the user message and agent response
        yield f"data: {json.dumps(user_message)}\n\n"
    yield 'data: END\n\n'

class MyResponse(Resource):
    def get(self):
        # SSE response using the Autogen agent
        return Response(generate(), content_type='text/event-stream')

api.add_resource(MyResponse, '/response')

if __name__ == '__main__':
    app.run(debug=True)
